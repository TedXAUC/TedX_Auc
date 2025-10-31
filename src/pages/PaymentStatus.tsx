import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom"; // Added useSearchParams
import axios from "axios";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
// Removed Supabase client import as we fetch status from backend now
import { toast } from "sonner";

// Define the expected structure of the successful booking data from the backend status endpoint
interface BookingStatusData {
    transactionId: string | null;
    amount: number; // Expect amount in paise from backend, like Razorpay order
    event_title: string;
    selected_seats: string[];
    customer_name: string;
    // Add other fields if your backend sends them
}


const PaymentStatus = () => {
    const { orderId } = useParams(); // Get Razorpay Order ID from URL
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); // To read query parameters like ?status=failed

    // Simplified status states
    const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
    const [message, setMessage] = useState("Verifying payment and booking status...");
    const [bookingDetails, setBookingDetails] = useState<BookingStatusData | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 4; // Retry check a few times (e.g., total ~10 seconds)
    const retryDelay = 2500; // milliseconds

    useEffect(() => {
        if (!orderId) {
            setStatus('failed');
            setMessage("No Order ID found in URL.");
            toast.error("Missing transaction information.");
            return;
        }

        const checkBookingStatus = async (attempt = 1) => {
            console.log(`Checking status for Order ID: ${orderId}, Attempt: ${attempt}`);
            setStatus('processing'); // Keep showing processing during checks
            setMessage(`Verifying payment and booking (Attempt ${attempt})...`);

            try {
                // Check for failure hint from URL first
                const clientStatusHint = searchParams.get('status');
                if (clientStatusHint === 'failed' && attempt === 1) { // Only use hint on first load
                    console.log("Client hinted failure, marking as failed.");
                    setStatus('failed');
                    setMessage("Payment failed or was cancelled.");
                    toast.error("Payment failed or was cancelled.");
                    return; // Stop checking if client knows it failed
                }


                // Call the NEW backend endpoint
                const response = await axios.get(
                  `${import.meta.env.VITE_API_BASE_URL}/api/payment/booking-status/${orderId}`
                );

                console.log("Backend status response:", response.data);

                if (response.data.success && response.data.status === 'SUCCESS') {
                    // SUCCESS: Booking found and active
                    setStatus('success');
                    setMessage(response.data.message || 'Booking confirmed!');
                    setBookingDetails(response.data.data);
                    toast.success("Booking confirmed successfully!");
                } else if (response.data.status === 'FAILED') {
                    // FAILED: Backend confirmed failure (or booking not active)
                    setStatus('failed');
                    setMessage(response.data.message || 'Booking confirmation failed.');
                    toast.error(response.data.message || 'Booking confirmation failed.');
                } else if (response.data.status === 'PROCESSING') {
                     // PROCESSING: Not found yet, might be webhook delay
                    if (attempt < maxRetries) {
                        setMessage(`${response.data.message || 'Payment received. Finalizing...'} Retrying check...`);
                        // Retry after delay
                        setTimeout(() => checkBookingStatus(attempt + 1), retryDelay);
                        setRetryCount(attempt); // Update retry count for UI if needed
                    } else {
                        // Max retries reached, assume failure or significant delay
                        setStatus('failed'); // Change to failed after retries
                        setMessage("Verification timed out. Booking may be delayed or failed. Please check your profile/email later or contact support.");
                        toast.warning("Booking verification timed out. Please check your profile.");
                    }
                }
                 else {
                    // Unexpected status from backend
                    throw new Error(response.data.message || 'Received unexpected status from server.');
                }

            } catch (error: any) {
                console.error("Error fetching booking status:", error);
                 let errorMsg = "An error occurred while verifying your booking.";
                 if (error.response?.data?.message) {
                     errorMsg = error.response.data.message;
                 } else if (error.message) {
                     errorMsg = error.message;
                 }

                if (attempt < maxRetries) {
                   setMessage(`${errorMsg} Retrying check...`);
                   setTimeout(() => checkBookingStatus(attempt + 1), retryDelay);
                   setRetryCount(attempt);
                } else {
                   setStatus('failed');
                   setMessage(`${errorMsg} Maximum retries reached.`);
                   toast.error("Failed to verify booking after multiple attempts.");
                }
            }
        };

        checkBookingStatus(); // Start the check

        // No cleanup needed for setTimeout if component unmounts during retry
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, navigate, searchParams]); // Add searchParams dependency


    return (
        <div className="pt-24 min-h-screen flex items-center justify-center">
            <div className="text-center card-glow p-8 max-w-md mx-auto">
                {status === 'processing' && (
                    <>
                        <ClockIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-spin" />
                        <h1 className="text-2xl font-bold mb-4">Processing Transaction...</h1>
                        <p className="text-muted-foreground">{message}</p>
                        {/* Optionally show retry count */}
                        {/* {retryCount > 0 && <p className="text-xs text-muted-foreground mt-2">(Check {retryCount}/{maxRetries})</p>} */}
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircleIcon className="h-16 w-16 mx-auto mb-4 text-green-500" />
                         <h1 className="text-2xl font-bold mb-4">Booking Successful!</h1>
                        <p className="text-muted-foreground mb-6">{message}</p>
                        {bookingDetails && (
                            <div className="text-left text-sm space-y-2 mb-6 bg-muted/50 p-4 rounded-lg border border-border">
                                {bookingDetails.transactionId && <p><strong>Payment ID:</strong> <span className="font-mono break-all">{bookingDetails.transactionId}</span></p>}
                                <p><strong>Event:</strong> {bookingDetails.event_title}</p>
                                <p><strong>Attendee:</strong> {bookingDetails.customer_name}</p>
                                <p><strong>Seats:</strong> {bookingDetails.selected_seats.join(', ')}</p>
                                <p><strong>Amount Paid:</strong> ₹{(bookingDetails.amount / 100).toLocaleString()}</p>
                            </div>
                        )}
                        <Button onClick={() => navigate('/profile')}>Go to My Tickets</Button>
                    </>
                )}

                {status === 'failed' && (
                     <>
                        <XCircleIcon className="h-16 w-16 text-destructive mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-4">Transaction Problem</h1>
                        <p className="text-muted-foreground mb-6">{message}</p>
                         {/* Go back to events page on failure */}
                        <Button variant="outline" onClick={() => navigate('/events')}>Back to Events</Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentStatus;