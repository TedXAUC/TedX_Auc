import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { CalendarIcon, MapPinIcon, ClockIcon, TicketIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { EventGallery } from "@/components/EventGallery";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// --- START: Define Types from Database ---
type EventStatus = "ongoing" | "upcoming" | "completed";
interface EventData extends Tables<"events"> {}

interface CategorizedEvents {
  ongoing: EventData[];
  upcoming: EventData[];
  completed: EventData[];
}
// --- END: Define Types from Database ---

const Events = () => {
  const [activeFilter, setActiveFilter] = useState<EventStatus>("upcoming");
  const [galleryOpen, setGalleryOpen] = useState(false);
  
  // State to hold the event selected for the gallery modal
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  // --- START: State for dynamic data fetching ---
  const [allEvents, setAllEvents] = useState<CategorizedEvents>({
    ongoing: [],
    upcoming: [],
    completed: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  // --- END: State for dynamic data fetching ---
  
  // --- START: Data Fetching Logic ---
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all event data from the new 'events' table
      const { data, error } = await supabase
        .from('events')
        .select('*')
        // Ordering by date ascending ensures upcoming events appear in chronological order
        .order('date', { ascending: true }); 

      if (error) throw error;

      // Categorize the fetched events based on the 'status' column
      const categorized: CategorizedEvents = { ongoing: [], upcoming: [], completed: [] };
      (data as EventData[]).forEach(event => {
        // --- FIX: Convert status to lowercase for robust categorization (fixes case sensitivity issue) ---
        const normalizedStatus = event.status.toLowerCase() as EventStatus;
        
        if (normalizedStatus in categorized) {
            categorized[normalizedStatus].push(event);
        } else {
            // Log a warning if an unexpected status is found, but don't break the app
            console.warn("Event with invalid status found:", event.status, event.title);
        }
      });
      
      setAllEvents(categorized);

    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Could not load events. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  // --- END: Data Fetching Logic ---


  const openGallery = (event: EventData) => {
    // Only open if there are images to show
    if (event.gallery_images && event.gallery_images.length > 0) {
        setSelectedEvent(event);
        setGalleryOpen(true);
    } else {
        toast.info("No gallery images available for this event.");
    }
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    setSelectedEvent(null);
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case "ongoing":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "upcoming":
        return "bg-primary/20 text-primary border-primary/30";
      case "completed":
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getStatusLabel = (status: EventStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  const EventCardSkeleton = () => (
     <div className="event-card p-6">
        <Skeleton className="w-full h-48 rounded-lg mb-4" />
        <Skeleton className="h-6 w-3/4 mb-3" />
        <div className="space-y-2 mb-4 text-sm">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-4 w-full mb-6" />
        <Skeleton className="h-10 w-full" />
    </div>
  )

  const eventsToDisplay = allEvents[activeFilter];

  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-background to-primary/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            <h1 className="text-5xl font-bold mb-8">
              Our <span className="gradient-text">Events</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Discover inspiring talks, workshops, and experiences that shape minds and transform perspectives.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {(["ongoing", "upcoming", "completed"] as const).map((status) => (
              <Button
                key={status}
                onClick={() => setActiveFilter(status)}
                variant={activeFilter === status ? "default" : "outline"}
                className={`px-8 py-3 text-lg font-semibold transition-all duration-300 ${
                  activeFilter === status 
                    ? "hero-button" 
                    : "border-primary/30 hover:border-primary hover:bg-primary/10"
                }`}
              >
                {getStatusLabel(status)}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
                // Show 3 skeletons while loading
                [...Array(3)].map((_, index) => <EventCardSkeleton key={index} />)
            ) : (
                eventsToDisplay.map((event, index) => (
                <div 
                    key={event.id} 
                    className="event-card animate-fade-in"
                    style={{animationDelay: `${index * 0.1}s`}}
                >
                    <div className="relative">
                    
                    {/* --- FIX: Updated image container to use padding-bottom for aspect ratio and object-contain --- */}
                    <div className="w-full pt-[66%] relative bg-muted rounded-lg mb-4 overflow-hidden"> 
                      <img
                          src={event.image_url} // Use image_url from DB
                          alt={event.title}
                          className="absolute inset-0 w-full h-full object-contain p-2" // object-contain ensures the whole image is visible
                          onError={(e) => {
                              e.currentTarget.onerror = null; 
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=contain';
                          }}
                      />
                    </div>
                    {/* --- END FIX --- */}
                    
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(event.status.toLowerCase() as EventStatus)}`}>
                        {getStatusLabel(event.status.toLowerCase() as EventStatus)}
                    </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 gradient-text">
                    {event.title}
                    </h3>
                    
                    <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4" />
                        <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{event.location}</span>
                    </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                    {event.description}
                    </p>
                    
                    {/* Button Logic */}
                    {event.tickets_available ? ( // Use tickets_available from DB
                    <Link to={`/book-event/${event.id}`}>
                        <Button className="w-full hero-button">
                            <TicketIcon className="h-5 w-5" />
                            Buy Tickets
                        </Button>
                    </Link>
                    ) : (
                        <div className="space-y-4">
                            {/* Show Event Pictures button if completed AND has gallery images */}
                            {event.status.toLowerCase() === "completed" && event.gallery_images && event.gallery_images.length > 0 && (
                                <Button 
                                    onClick={() => openGallery(event)}
                                    className="w-full bg-muted hover:bg-muted/80 text-foreground"
                                >
                                    Event Pictures
                                </Button>
                            )}
                            {/* Always show Event Completed button if tickets are unavailable */}
                            <Button disabled className="w-full">
                                Event Completed
                            </Button>
                        </div>
                    )}
                </div>
                ))
            )}
          </div>
          
          {!isLoading && eventsToDisplay.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold mb-4 text-muted-foreground">
                No {activeFilter} events found
              </h3>
              <p className="text-muted-foreground">
                Stay tuned for more exciting events coming soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-gradient-to-r from-primary/10 to-primary/5 border-y border-primary/20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Stay Updated</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Don't miss out on our upcoming events. Subscribe to our newsletter for the latest updates.
          </p>
          <Link to="/contact">
            <Button className="hero-button">
              Subscribe Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Event Gallery Modal */}
      {selectedEvent && (
        <EventGallery
          isOpen={galleryOpen}
          onClose={closeGallery}
          eventTitle={selectedEvent.title}
          images={selectedEvent.gallery_images || []} // Safely pass empty array if null
        />
      )}
    </div>
  );
};

export default Events;