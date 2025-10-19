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
// Optional: If you use the auth check, you'll need this
// import { useAuth } from "@/contexts/AuthContext";

// This interface is simple again, no price
interface Seat {
  id: string; // e.g., 'A1'
  row: string;
  number: number;
}

// Seat with status
interface SeatWithStatus extends Seat {
    status: "available" | "selected" | "booked";
}

interface EventData extends Tables<"events"> {}

const EventBooking = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  // const { session } = useAuth(); // Optional: For auth check
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingStep, setBookingStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({ name: "", email: "", phone: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State holds the full seat layout with status
  const [seats, setSeats] = useState<SeatWithStatus[]>([]); 
  const [isLoadingSeats, setIsLoadingSeats] = useState(true);
  const [event, setEvent] = useState<EventData | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // This is the original, simple seat layout generator
  const generateSeatLayout = (): Seat[] => {
    const layout: Seat[] = [];
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
    return layout;
  };

  // --- REVERTED DATA FETCHING LOGIC ---
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

  // --- REVERTED TOTAL AMOUNT CALCULATION ---
  // Uses the single event price
  const totalAmount = selectedSeats.length * (event?.price ?? 500);

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

  const getSeatColor = (seat: SeatWithStatus) => {
    if (seat.status === "booked") return "bg-destructive/50 text-destructive-foreground cursor-not-allowed opacity-60";
    if (seat.status === "selected") return "bg-primary text-primary-foreground";
    return "bg-card border border-border hover:border-primary/80 hover:bg-primary/10 cursor-pointer transition-colors duration-200";
  };

  // --- REVERTED SUBMIT HANDLER ---
  // No longer adds 'event_id_for_seats'
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
      // --- Optional: Uncomment this block to force login ---
      // if (!session) { 
      //   toast.error("You must be logged in to complete a booking.");
      //   navigate('/login'); 
      //   return;
      // }
      // --- End of check ---
        
      if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
        toast.error("Please fill in all customer details");
        return;
      }
      
      setIsProcessing(true);
      const toastId = toast.loading("Connecting to payment gateway...");

      try {
       const response = await axios.post(
  `${import.meta.env.VITE_API_BASE_URL}/api/payment/initiate`,
  { // <-- You were missing this opening brace
    amount: finalAmount,
  } // <-- You were missing this closing brace
);

        if (!response.data.success) {
          throw new Error(response.data.message || "Payment initiation failed.");
        }

        toast.success("Redirecting to payment page...", { id: toastId });

        const { merchantTransactionId } = response.data.data;
        const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;

        // Create the simple booking details, just as before
        const bookingDetails: TablesInsert<"bookings"> = {
          event_title: event.title,
          event_date: event.date,
          event_time: event.time,
          selected_seats: selectedSeats,
          seat_count: selectedSeats.length,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          total_amount: totalAmount,
        };

        // Save to localStorage
        localStorage.setItem(`pending_booking_${merchantTransactionId}`, JSON.stringify(bookingDetails));

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);

      } catch (error: any) {
        toast.error(error.message || "Could not start payment. Please try again.", { id: toastId });
        console.error("Error initiating booking payment:", error);
        setIsProcessing(false);
      }
    }
  };

  // --- Loading / Error States ---
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

  // --- Render Function ---
  const renderStepContent = () => {
     switch (bookingStep) {
      case 1:
        return (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8">Select Your Seats</h2>
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
            <div className="mb-8 text-center">
              <div className="inline-block bg-gradient-to-r from-primary/20 to-primary/10 px-8 py-2 rounded-t-3xl">
                <span className="text-lg font-semibold gradient-text">SCREEN</span>
              </div>
            </div>

            <>
            <p className="text-center text-sm text-muted-foreground mb-4 md:hidden">
                ← Swipe/Scroll horizontally to see all seats →
            </p>
            <div className="max-w-full overflow-x-auto pb-4 hide-scrollbar">
                <div className="min-w-[800px] mx-auto space-y-2 mb-8">
                    {["A", "B", "C", "D", "E", "F", "G", "H", "I"].map((row) => (
                        <div key={row} className="flex items-center justify-center gap-4">
                            <span className="w-8 text-center font-bold text-muted-foreground">{row}</span>
                            <div className="flex gap-1">
                                {seats.filter(s => s.row === row && s.number <= 14).map(seat => (
                                    <button key={seat.id} onClick={() => handleSeatClick(seat.id)} className={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${getSeatColor(seat)}`} disabled={seat.status === 'booked'}>
                                        {seat.number}
                                    </button>
                                ))}
                            </div>
                            <div className="w-8"></div>
                            <div className="flex gap-1">
                                {seats.filter(s => s.row === row && s.number > 14).map(seat => (
                                        <button key={seat.id} onClick={() => handleSeatClick(seat.id)} className={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${getSeatColor(seat)}`} disabled={seat.status === 'booked'}>
                                        {seat.number}
                                    </button>
                                ))}
                            </div>
                            <span className="w-8 text-center font-bold text-muted-foreground">{row}</span>
                        </div>
                    ))}
                    <div className="h-8"></div>
                    {["J", "K", "L", "M"].map((row) => (
                            <div key={row} className="flex items-center justify-center gap-4">
                            <span className="w-8 text-center font-bold text-muted-foreground">{row}</span>
                            <div className="flex gap-1">
                                {seats.filter(s => s.row === row && s.number <= 4).map(seat => (
                                        <button key={seat.id} onClick={() => handleSeatClick(seat.id)} className={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${getSeatColor(seat)}`} disabled={seat.status === 'booked'}>
                                        {seat.number}
                                    </button>
                                ))}
                            </div>
                            <div className="w-8"></div>
                            <div className="flex gap-1">
                                {seats.filter(s => s.row === row && s.number > 4 && s.number <= 18).map(seat => (
                                    <button key={seat.id} onClick={() => handleSeatClick(seat.id)} className={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${getSeatColor(seat)}`} disabled={seat.status === 'booked'}>
                                        {seat.number}
                                    </button>
                                ))}
                            </div>
                            <div className="w-8"></div>
                            <div className="flex gap-1">
                                {seats.filter(s => s.row === row && s.number > 18).map(seat => (
                                    <button key={seat.id} onClick={() => handleSeatClick(seat.id)} className={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${getSeatColor(seat)}`} disabled={seat.status === 'booked'}>
                                        {seat.number}
                                    </button>
                                ))}
                            </div>
                            <span className="w-8 text-center font-bold text-muted-foreground">{row}</span>
                        </div>
                    ))}
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
                </div>
            </div>
            </>

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
                  {/* --- THIS IS THE FIX --- */}
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
                <Button onClick={handleBookingSubmit} className="w-full hero-button" disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Proceed to Payment"}
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
