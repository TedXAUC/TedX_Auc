import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";

const EMAIL_WEBHOOK_SECRET = import.meta.env.VITE_EMAIL_WEBHOOK_SECRET;

const PaymentStatus = () => {
    const { merchantTransactionId } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'processing' | 'success' | 'partial_success' | 'failed'>('processing');
    const [message, setMessage] = useState("Verifying payment and finalizing transaction...");
    const [transactionDetails, setTransactionDetails] = useState<any>(null);

    const [transactionType, setTransactionType] = useState<'booking' | 'donation' | 'unknown'>('unknown');
    // We only need this for the "Try Again" button
    const [eventTitleForNav, setEventTitleForNav] = useState<string | null>(null);


    useEffect(() => {
        if (!merchantTransactionId) {
            setStatus('failed');
            setMessage("No transaction ID found in URL.");
            toast.error("Missing transaction information.");
            return;
        }

        const finalizeTransaction = async () => {
            let bookingId: number | null = null;
            // This type no longer needs 'event_id_for_seats'
            let retrievedBookingDetails: TablesInsert<"bookings"> | null = null;
            let retrievedDonationDetails: TablesInsert<"donations"> | null = null;

            try {
                // 1. Retrieve pending details
                const pendingBookingJSON = localStorage.getItem(`pending_booking_${merchantTransactionId}`);
                const pendingDonationJSON = localStorage.getItem(`pending_donation_${merchantTransactionId}`);

                if (pendingBookingJSON) {
                    setTransactionType('booking');
                    try {
                        retrievedBookingDetails = JSON.parse(pendingBookingJSON);
                        setEventTitleForNav(retrievedBookingDetails?.event_title ?? null); // For nav
                        if (!retrievedBookingDetails || !retrievedBookingDetails.selected_seats) {
                            throw new Error("Incomplete booking details found in local storage.");
                        }
                    } catch (parseError) {
                         throw new Error("Could not retrieve valid booking details for this transaction.");
                    }
                } else if (pendingDonationJSON) {
                    setTransactionType('donation');
                     try {
                        retrievedDonationDetails = JSON.parse(pendingDonationJSON);
                         if (!retrievedDonationDetails?.amount) {
                             throw new Error("Incomplete donation details found in local storage.");
                         }
                    } catch (parseError) {
                         throw new Error("Could not retrieve valid donation details for this transaction.");
                    }
                } else {
                     setTransactionType('unknown');
                     setMessage("Payment status check initiated, but no pending transaction details found on this device.");
                }


                // 2. Check payment status
                setMessage("Checking payment status with gateway...");
                // NEW CODE (Correct - uses the VITE_API_BASE_URL environment variable)
const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/payment/status/${merchantTransactionId}`);

                if (response.data.success && response.data.code === 'PAYMENT_SUCCESS') {
                    const paymentData = response.data.data;
                    setTransactionDetails(paymentData);
                    let recordToEmail: any = null;

                    // --- Handle BOOKING ---
                    if (retrievedBookingDetails) {
                        setMessage("Payment successful! Saving your booking record...");
                        
                        // Simple insert object, no event_id to remove
                        const insertData = {
                            ...retrievedBookingDetails,
                            transaction_id: paymentData.transactionId,
                            is_ticket_active: true,
                        };

                        // 3. Save booking to 'bookings' table
                        const { data: newBooking, error: insertError } = await supabase
                            .from('bookings')
                            .insert(insertData)
                            .select()
                            .single();

                        if (insertError) {
                             console.error("Failed to save booking to DB:", insertError);
                             setMessage(`Payment successful, but failed to save booking record: ${insertError.message}. Please contact support.`);
                             setStatus('partial_success');
                             localStorage.removeItem(`pending_booking_${merchantTransactionId}`);
                             return;
                        } 
                        
                        // --- Booking Insert Successful ---
                        bookingId = newBooking.id;
                        recordToEmail = newBooking;
                        setMessage("Booking saved! Sending confirmation email...");
                        setStatus('success');
                        toast.success("Booking successful! Finalizing...");

                        // 4. *** SIMPLIFIED STEP: Call Email Function ***
                        try {
                            console.log(`Invoking simple email function for booking ${bookingId}`);
                            const emailResponse = await fetch(
                                `https://lehpiptexuxbnxgdunmc.supabase.co/functions/v1/send-booking-email-secure?secret=${EMAIL_WEBHOOK_SECRET}`,
                                {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    // *** KEY CHANGE: Only send the record ***
                                    body: JSON.stringify({ 
                                        record: recordToEmail
                                    })
                                }
                            );

                            if (!emailResponse.ok) {
                                const errorBody = await emailResponse.json().catch(() => ({ message: "Unknown function error" }));
                                throw new Error(errorBody.message || `Function failed with status ${emailResponse.status}`);
                            }

                            setMessage("Booking confirmed and email sent!");

                        } catch (functionError: any) {
                            console.error(`Email function failed for booking ${bookingId}: ${functionError.message}`);
                            // This is a partial success: payment and booking OK, but email failed.
                            setMessage(`Booking confirmed, but confirmation email failed to send: ${functionError.message}. Your ticket is safe in your profile.`);
                            setStatus('partial_success');
                        }
                        // --- END OF SIMPLIFIED STEP ---

                        localStorage.removeItem(`pending_booking_${merchantTransactionId}`);

                    // --- Handle DONATION (Unchanged) ---
                    } else if (retrievedDonationDetails) {
                        setMessage("Payment successful! Saving your donation...");
                        const { error: donationError } = await supabase.from('donations').insert({
                            ...retrievedDonationDetails,
                            transaction_id: paymentData.transactionId,
                        });

                        if (donationError){
                            console.error("Failed to save donation:", donationError);
                            setMessage(`Payment successful, but failed to save donation record: ${donationError.message}. Please contact support.`);
                            setStatus('partial_success');
                        } else {
                            setMessage("Thank you for your generous donation!");
                            setStatus('success');
                            toast.success("Donation recorded successfully!");
                        }
                        localStorage.removeItem(`pending_donation_${merchantTransactionId}`);

                    // --- Handle missing local data (Unchanged) ---
                    } else {
                        setStatus('success');
                        setMessage("Payment confirmed via gateway. However, the original transaction details were not found on this device. Please check your email or profile for confirmation.");
                        toast.warning("Payment confirmed, but couldn't finalize local details.");
                    }

                // --- Handle PAYMENT FAILED (Unchanged) ---
                } else {
                    setStatus('failed');
                    setMessage(response.data.message || "The payment gateway reported the payment was not successful.");
                    toast.error("Payment failed or was cancelled.");
                    localStorage.removeItem(`pending_booking_${merchantTransactionId}`);
                    localStorage.removeItem(`pending_donation_${merchantTransactionId}`);
                }
            } catch (error: any) {
                console.error("Error finalizing transaction:", error);
                setStatus('failed');
                setMessage(`An unexpected error occurred during finalization: ${error.message}`);
                toast.error("An unexpected error occurred.");
                localStorage.removeItem(`pending_booking_${merchantTransactionId}`);
                localStorage.removeItem(`pending_donation_${merchantTransactionId}`);
            }
        };

        finalizeTransaction();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [merchantTransactionId]);

    // --- The JSX (return) part of the component is unchanged ---
    const isSuccess = status === 'success' || status === 'partial_success';

    return (
        <div className="pt-24 min-h-screen flex items-center justify-center">
            <div className="text-center card-glow p-8 max-w-md mx-auto">
                {status === 'processing' && (
                    <>
                        <ClockIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-spin" />
                        <h1 className="text-2xl font-bold mb-4">Processing Transaction...</h1>
                        <p className="text-muted-foreground">{message}</p>
                    </>
                )}

                {isSuccess && (
                    <>
                        <CheckCircleIcon className={`h-16 w-16 mx-auto mb-4 ${status === 'success' ? 'text-green-500' : 'text-yellow-500'}`} />
                         <h1 className="text-2xl font-bold mb-4">
                           {status === 'success' ? 'Payment Successful!' : 'Payment Processed (with notes)'}
                         </h1>
                        <p className={`mb-6 ${status === 'partial_success' ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}`}>{message}</p>
                        {transactionDetails && (
                            <div className="text-left text-sm space-y-2 mb-6 bg-muted/50 p-4 rounded-lg border border-border">
                                <p><strong>Transaction ID:</strong> <span className="font-mono break-all">{transactionDetails.transactionId}</span></p>
                                <p><strong>Amount Paid:</strong> ₹{(transactionDetails.amount / 100).toLocaleString()}</p>
                            </div>
                        )}
                         {transactionType === 'booking' && (
                             <Button onClick={() => navigate('/profile')}>Go to My Tickets</Button>
                         )}
                         {transactionType === 'donation' && (
                              <Button onClick={() => navigate('/')}>Go to Home</Button>
                         )}
                         {transactionType === 'unknown' && (
                               <Button onClick={() => navigate('/')}>Go to Home</Button>
                          )}
                    </>
                )}

                {status === 'failed' && (
                     <>
                        <XCircleIcon className="h-16 w-16 text-destructive mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-4">Transaction Failed</h1>
                        <p className="text-muted-foreground mb-6">{message}</p>
                        {/* We don't have event_id anymore, so just link to /events */}
                        {transactionType === 'booking' ? (
                             <Button variant="outline" onClick={() => navigate(`/events`)}>Back to Events</Button>
                        ) : transactionType === 'donation' ? (
                             <Button variant="outline" onClick={() => navigate('/donate')}>Try Donating Again</Button>
                        ): (
                             <Button variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentStatus;
