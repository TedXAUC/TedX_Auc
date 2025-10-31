import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
// Optional: Use Auth context if needed, for pre-filling info
import { useAuth } from "@/contexts/AuthContext";

// --- Interfaces (remain mostly the same) ---
interface Seat {
  id: string; // e.g., 'A1'
  row: string;
  number: number;
}

interface SeatWithStatus extends Seat {
    status: "available" | "selected" | "booked";
}

interface EventData extends Tables<"events"> {}

// --- Razorpay Specific Types ---
interface RazorpayOptions {
    key: string;
    amount: number; // Amount in paise
    currency: string;
    name: string;
    description: string;
    image?: string;
    order_id: string;
    handler: (response: RazorpayPaymentSuccessResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, any>;
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
}

interface RazorpayPaymentSuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

// --- Declare Razorpay on window ---
declare global {
    interface Window {
        Razorpay: any; // Use 'any' for simplicity, or install @types/razorpay if available
    }
}
// --- End Razorpay Types ---

const EventBooking = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user from Auth context
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingStep, setBookingStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({ name: "", email: "", phone: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [seats, setSeats] = useState<SeatWithStatus[]>([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(true);
  const [event, setEvent] = useState<EventData | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // --- Pre-fill customer info if user is logged in ---
  useEffect(() => {
    if (user && !customerInfo.name && !customerInfo.email) {
      // Fetch profile data if needed, similar to Profile.tsx or Donate.tsx
      // For simplicity, using auth metadata directly here.
      // A more robust solution would fetch from the 'profiles' table.
      setCustomerInfo({
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
        phone: "" // Phone usually needs separate fetching/input
      });
    }
  }, [user, customerInfo.name, customerInfo.email]); // Re-run if user changes


  // --- Seat Layout Generation ---
  const generateSeatLayout = (): Seat[] => {
    const layout: Seat[] = [];

    // --- Existing Layout Generation ---
    const regularRows = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    regularRows.forEach((row) => {
      for (let i = 1; i <= 28; i++) {
        layout.push({ id: `${row}${i}`, row, number: i });
      }
    });
    const backRows = ["J", "K", "L", "M"];
    backRows.forEach((row) => {
      for (let i = 1; i <= 22; i++) {
        layout.push({ id: `${row}${i}`, row, number: i });
      }
    });
    for (let i = 1; i <= 9; i++) {
      layout.push({ id: `LAST${i}`, row: "LAST", number: i });
    }
    // --- End Existing Layout ---

    // --- ADD UPPER BALCONY AT THE END ---
    const upperBalconyRows = ["UB1", "UB2", "UB3"]; // Naming rows UB1, UB2, UB3
    upperBalconyRows.forEach((row) => {
      for (let i = 1; i <= 22; i++) { // Generate seats 1 to 22 for each UB row
        layout.push({ id: `${row}${i}`, row, number: i });
      }
    });
    // --- END UPPER BALCONY ---

    return layout;
  };

  // --- Data Fetching ---
  const fetchEventAndBookedSeats = useCallback(async (id: number) => {
    setIsLoadingEvent(true);
    setIsLoadingSeats(true);
    setFetchError(null);
    let fetchedEvent: EventData | null = null;
    let bookedSeatIds: Set<string> = new Set();

    try {
      // 1. Fetch Event Details
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (eventError) {
        if (eventError.code === 'PGRST116') throw new Error("Event not found.");
        throw eventError;
      }
      fetchedEvent = eventData as EventData;
      setEvent(fetchedEvent);
      setIsLoadingEvent(false);

      // 2. Fetch Booked Seats from 'bookings' table
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('selected_seats')
        .eq('event_title', fetchedEvent.title); // Match by title

      if (bookingsError) throw bookingsError;

      // Flatten all booked seats into a single Set for fast lookup
      bookingsData.forEach(booking => {
        booking.selected_seats.forEach(seatId => {
          bookedSeatIds.add(seatId);
        });
      });

      // 3. Generate layout and merge with status
      const baseLayout = generateSeatLayout();
      const seatsWithStatus = baseLayout.map(seat => ({
        ...seat,
        status: bookedSeatIds.has(seat.id) ? 'booked' : 'available' as "available" | "selected" | "booked",
      }));

      setSeats(seatsWithStatus);
      setIsLoadingSeats(false);

    } catch (error: any) {
      console.error("Error fetching event or bookings:", error);
      const errorMessage = error.message || "Could not load event data.";
      toast.error(errorMessage);
      setFetchError(errorMessage);
      setEvent(null);
      setIsLoadingEvent(false);
      setIsLoadingSeats(false);
    }
  }, []);

  useEffect(() => {
    const id = Number(eventId);
    if (!isNaN(id) && id > 0) {
      fetchEventAndBookedSeats(id);
    } else {
      toast.error("Invalid Event ID.");
      setFetchError("Invalid Event ID.");
      setIsLoadingEvent(false);
      setIsLoadingSeats(false);
    }
  }, [eventId, fetchEventAndBookedSeats]);


  // --- Total Amount Calculation ---
  const totalAmount = selectedSeats.length * (event?.price ?? 500);

  // --- Seat Click Handler ---
  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status === "booked") return;

    // Update selectedSeats state
    const newSelectedSeats = selectedSeats.includes(seatId)
      ? selectedSeats.filter(id => id !== seatId)
      : [...selectedSeats, seatId];
    setSelectedSeats(newSelectedSeats);

    // Update the status visually in the local 'seats' state
    setSeats(currentSeats =>
        currentSeats.map(s =>
            s.id === seatId
                ? { ...s, status: newSelectedSeats.includes(seatId) ? 'selected' : 'available' }
                : s
        )
    );
  };

  // --- getSeatColor ---
  const getSeatColor = (seat: SeatWithStatus) => {
    if (seat.status === "booked") return "bg-destructive/50 text-destructive-foreground cursor-not-allowed opacity-60";
    if (seat.status === "selected") return "bg-primary text-primary-foreground";
    return "bg-card border border-border hover:border-primary/80 hover:bg-primary/10 cursor-pointer transition-colors duration-200";
  };

  // --- Booking Submit Handler ---
  const handleBookingSubmit = async () => {
    if (!event) {
        toast.error("Event data is not loaded correctly.");
        return;
    }

    if (bookingStep === 1) {
      if (selectedSeats.length === 0) {
        toast.error("Please select at least one seat");
        return;
      }
      setBookingStep(2);
    } else if (bookingStep === 2) {
      if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
        toast.error("Please fill in all customer details");
        return;
      }

      setIsProcessing(true);
      const toastId = toast.loading("Preparing your order...");

      try {
        // 1. Prepare Notes for Razorpay
        const orderNotes = {
            type: 'booking',
            event_id: event.id.toString(),
            event_title: event.title,
            event_date: event.date,
            event_time: event.time,
            selected_seats: selectedSeats.join(', '),
            seat_count: selectedSeats.length.toString(),
            customer_name: customerInfo.name,
            customer_email: customerInfo.email,
            customer_phone: customerInfo.phone,
        };

        // 2. Call backend to create Razorpay order
        console.log("Calling backend to create order with amount:", totalAmount, "and notes:", orderNotes);
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/payment/create-order`,
          {
            amount: totalAmount,
            notes: orderNotes
          }
        );

        if (!response.data.success || !response.data.order_id) {
          throw new Error(response.data.message || "Failed to create payment order.");
        }

        const { order_id, amount: amountInPaise, currency, key_id } = response.data;
        toast.success("Order created. Opening payment window...", { id: toastId });

        // 3. Configure Razorpay Checkout options
        const options: RazorpayOptions = {
            key: key_id,
            amount: amountInPaise,
            currency: currency,
            name: "TEDxAUC",
            description: `Booking for ${event.title}`,
            image: "https://www.tedxamity.com/tedxauc-logo-new.png",
            order_id: order_id,
            handler: (response: RazorpayPaymentSuccessResponse) => {
                console.log("Razorpay Client Success Response:", response);
                toast.success("Payment successful! Verifying booking...");
                navigate(`/payment-status/${response.razorpay_order_id}`);
            },
            prefill: {
                name: customerInfo.name,
                email: customerInfo.email,
                contact: customerInfo.phone,
            },
            notes: orderNotes,
            theme: {
                color: "#E62B1E"
            },
            modal: {
                ondismiss: () => {
                    console.log("Razorpay Checkout closed");
                    toast.info("Payment window closed.");
                    setIsProcessing(false);
                }
            }
        };

        // 4. Open Razorpay Checkout
        if (!window.Razorpay) {
            toast.error("Razorpay Checkout script not loaded. Please refresh.", { id: toastId });
            setIsProcessing(false);
            return;
        }

        const rzp = new window.Razorpay(options);

        rzp.on('payment.failed', (response: any) => {
            console.error("Razorpay Payment Failed:", response.error);
            toast.error(`Payment failed: ${response.error.description || response.error.reason || 'Unknown error'}. Please try again.`);
            navigate(`/payment-status/${order_id}?status=failed`);
            setIsProcessing(false);
        });

        rzp.open();

      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || "Could not start payment. Please try again.";
        toast.error(errorMessage, { id: toastId });
        console.error("Error initiating Razorpay payment:", error);
        setIsProcessing(false);
      }
    }
  };


  // --- Loading / Error / Render States ---
  if (isLoadingEvent || isLoadingSeats) {
     return (
        <div className="pt-24 min-h-screen flex items-center justify-center">
             <div className="text-center p-8 max-w-4xl w-full">
                <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
                <Skeleton className="h-4 w-1/2 mx-auto mb-10" />
                <div className="max-w-6xl mx-auto space-y-2">
                    {[...Array(13)].map((_, i) => (
                    <div key={i} className="flex justify-center items-center gap-4">
                        <Skeleton className="h-6 w-8" />
                        <Skeleton className="h-6 flex-1 max-w-xs" />
                        <Skeleton className="h-6 w-8" />
                        <Skeleton className="h-6 flex-1 max-w-xs" />
                        <Skeleton className="h-6 w-8" />
                    </div>
                    ))}
                 </div>
            </div>
        </div>
     );
  }

  if (fetchError || !event) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center card-glow p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-destructive">Error Loading Event</h1>
          <p className="text-muted-foreground mb-6">{fetchError || "Could not load event data. Please try again later."}</p>
          <Button onClick={() => navigate("/events")}>Back to Events</Button>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
     switch (bookingStep) {
      case 1:
        return (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8">Select Your Seats</h2>
             {/* Seat Legend */}
             <div className="flex justify-center items-center gap-6 mb-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-card border border-border"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary"></div>
                    <span>Selected</span>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-destructive/50 opacity-60"></div>
                    <span>Booked</span>
                </div>
            </div>

            {/* SCREEN Label */}
            <div className="mb-8 text-center">
              <div className="inline-block bg-gradient-to-r from-primary/20 to-primary/10 px-8 py-2 rounded-t-3xl">
                <span className="text-lg font-semibold gradient-text">SCREEN</span>
              </div>
            </div>

            {/* Horizontal Scroll Hint for Mobile */}
            <p className="text-center text-sm text-muted-foreground mb-4 md:hidden">
                ← Swipe/Scroll horizontally to see all seats →
            </p>

            {/* --- Main Seat Container --- */}
            <div className="max-w-full overflow-x-auto pb-4 hide-scrollbar">
                <div className="min-w-[800px] mx-auto space-y-2 mb-8">
                    {/* Rows A-I */}
                    {["A", "B", "C", "D", "E", "F", "G", "H", "I"].map((row) => (
                        <div key={row} className="flex items-center justify-center gap-4">
                            <span className="w-8 text-center font-bold text-muted-foreground">{row}</span>
                            <div className="flex gap-1">
                                {/* Seats 1-14 */}
                                {seats.filter(s => s.row === row && s.number <= 14).map(seat => (
                                    <button key={seat.id} onClick={() => handleSeatClick(seat.id)} className={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${getSeatColor(seat)}`} disabled={seat.status === 'booked'}>
                                        {seat.number}
                                    </button>
                                ))}
                            </div>
                            <div className="w-8"></div> {/* Aisle */}
                            <div className="flex gap-1">
                                {/* Seats 15-28 */}
                                {seats.filter(s => s.row === row && s.number > 14).map(seat => (
                                    <button key={seat.id} onClick={() => handleSeatClick(seat.id)} className={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${getSeatColor(seat)}`} disabled={seat.status === 'booked'}>
                                        {seat.number}
                                    </button>
                                ))}
                            </div>
                             <span className="w-8 text-center font-bold text-muted-foreground">{row}</span>
                        </div>
                    ))}
                    {/* Spacer */}
                    <div className="h-8"></div>
                    {/* Rows J-M */}
                    {["J", "K", "L", "M"].map((row) => (
                        <div key={row} className="flex items-center justify-center gap-4">
                           <span className="w-8 text-center font-bold text-muted-foreground">{row}</span>
                            {/* Seats 1-4 */}
                            <div className="flex gap-1">
                                {seats.filter(s => s.row === row && s.number <= 4).map(seat => (
                                        <button key={seat.id} onClick={() => handleSeatClick(seat.id)} className={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${getSeatColor(seat)}`} disabled={seat.status === 'booked'}>
                                        {seat.number}
                                    </button>
                                ))}
                            </div>
                            <div className="w-8"></div> {/* Aisle 1 */}
                            <div className="flex gap-1">
                                {/* Seats 5-18 */}
                                {seats.filter(s => s.row === row && s.number > 4 && s.number <= 18).map(seat => (
                                    <button key={seat.id} onClick={() => handleSeatClick(seat.id)} className={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${getSeatColor(seat)}`} disabled={seat.status === 'booked'}>
                                        {seat.number}
                                    </button>
                                ))}
                            </div>
                            <div className="w-8"></div> {/* Aisle 2 */}
                             <div className="flex gap-1">
                                 {/* Seats 19-22 */}
                                {seats.filter(s => s.row === row && s.number > 18).map(seat => (
                                    <button key={seat.id} onClick={() => handleSeatClick(seat.id)} className={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${getSeatColor(seat)}`} disabled={seat.status === 'booked'}>
                                        {seat.number}
                                    </button>
                                ))}
                            </div>
                            <span className="w-8 text-center font-bold text-muted-foreground">{row}</span>
                        </div>
                    ))}
                    {/* Last Row */}
                    <div className="flex items-center justify-center gap-4 pt-4 border-t border-dashed border-border">
                        <div className="flex gap-1">
                            {seats.filter(s => s.row === "LAST").map(seat => (
                                <button key={seat.id} onClick={() => handleSeatClick(seat.id)} className={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${getSeatColor(seat)}`} disabled={seat.status === 'booked'}>
                                    {seat.number}
                                </button>
                            ))}
                        </div>
                        <span className="text-sm text-muted-foreground">Last Row</span>
                    </div>

                     {/* --- START: ADD UPPER BALCONY SECTION (Moved Here) --- */}
                    {/* Divider Line */}
                    <div className="h-0 border-b border-dashed border-border/50 mt-8 mb-6 max-w-sm mx-auto"></div>
                    {/* Balcony Label */}
                    <div className="mb-6 text-center">
                        <div className="inline-block border-t border-b border-dashed border-border/50 px-8 py-1">
                            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Upper Balcony</span>
                        </div>
                    </div>
                     {/* Balcony Rows */}
                    <div className="space-y-2">
                        {["UB1", "UB2", "UB3"].map((row) => (
                            <div key={row} className="flex items-center justify-center gap-4">
                            {/* Seats 1-4 */}
                            <div className="flex gap-1">
                                {seats.filter(s => s.row === row && s.number <= 4).map(seat => (
                                <button key={seat.id} onClick={() => handleSeatClick(seat.id)} className={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${getSeatColor(seat)}`} disabled={seat.status === 'booked'}>
                                    {seat.number}
                                </button>
                                ))}
                            </div>
                            {/* Gap 1 */}
                            <div className="w-8"></div> {/* Spacer for the gap */}
                            {/* Seats 5-18 */}
                            <div className="flex gap-1">
                                {seats.filter(s => s.row === row && s.number > 4 && s.number <= 18).map(seat => (
                                <button key={seat.id} onClick={() => handleSeatClick(seat.id)} className={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${getSeatColor(seat)}`} disabled={seat.status === 'booked'}>
                                    {seat.number}
                                </button>
                                ))}
                            </div>
                            {/* Gap 2 */}
                            <div className="w-8"></div> {/* Spacer for the gap */}
                            {/* Seats 19-22 */}
                            <div className="flex gap-1">
                                {seats.filter(s => s.row === row && s.number > 18).map(seat => (
                                <button key={seat.id} onClick={() => handleSeatClick(seat.id)} className={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${getSeatColor(seat)}`} disabled={seat.status === 'booked'}>
                                    {seat.number}
                                </button>
                                ))}
                            </div>
                            </div>
                        ))}
                    </div>
                    {/* --- END UPPER BALCONY SECTION --- */}

                </div>
            </div>
            {/* --- End Main Seat Container --- */}

            {/* Booking Summary */}
            {selectedSeats.length > 0 && (
              <div className="card-glow p-6 max-w-md mx-auto mt-8">
                <h3 className="text-lg font-bold mb-4">Booking Summary</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Selected Seats:</span>
                    <span className="font-semibold">{selectedSeats.join(", ")}</span>
                  </div>
                   <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span className="font-semibold">{selectedSeats.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per seat:</span>
                    <span className="font-semibold">₹{event?.price ?? 500}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="gradient-text">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                <Button onClick={handleBookingSubmit} className="w-full hero-button">
                  Continue to Customer Details
                </Button>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="max-w-md mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8">Customer Details</h2>
            <div className="card-glow p-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={customerInfo.name} onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} placeholder="Enter your full name" required/>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={customerInfo.email} onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})} placeholder="Enter your email" required/>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={customerInfo.phone} onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} placeholder="Enter your phone number" required/>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between mb-2 text-sm text-muted-foreground">
                    <span>Seats: {selectedSeats.join(", ")} ({selectedSeats.length})</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="gradient-text">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                {/* Updated Button */}
                <Button onClick={handleBookingSubmit} className="w-full hero-button" disabled={isProcessing}>
                  {isProcessing ? "Processing..." : `Pay ₹${totalAmount.toLocaleString()} with Razorpay`}
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  // --- Main Return JSX ---
  return (
    <div className="pt-24 min-h-screen">
      <div className="bg-card border-b border-border sticky top-[72px] z-40">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => bookingStep > 1 ? setBookingStep(bookingStep - 1) : navigate("/events")}
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>{bookingStep > 1 ? 'Back to Seats' : 'Back to Events'}</span>
            </Button>
            <div className="text-right">
              <h1 className="text-xl font-bold gradient-text truncate">{event.title}</h1>
              <p className="text-muted-foreground text-sm">{event.date} • {event.time}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
         <div className="flex items-center justify-center mb-12">
          {[
            { step: 1, label: "Select Seats" },
            { step: 2, label: "Details & Pay" }
           ].map(({step, label}, index) => (
            <React.Fragment key={step}>
                <div className="flex flex-col items-center px-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors duration-300 ${bookingStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border"}`}>
                    {bookingStep > step ? <CheckCircleIcon className="h-6 w-6" /> : step}
                    </div>
                    <span className={`mt-2 text-xs font-medium transition-colors duration-300 text-center ${bookingStep >= step ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
                </div>
              {index < 1 && ( <div className={`flex-1 h-1 mx-1 transition-colors duration-300 ${bookingStep > step ? "bg-primary" : "bg-muted"}`} /> )}
            </React.Fragment>
          ))}
        </div>
        {renderStepContent()}
      </div>
    </div>
  );
};

export default EventBooking;
