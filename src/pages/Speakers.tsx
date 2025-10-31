import { useState, useEffect, useCallback } from "react";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";

// Define the Speaker interface based on your Supabase table for clear typing
interface SpeakerData extends Tables<"speakers"> {}

const Speakers = () => {
  // Removed carousel state and logic: isPaused, scrollRef, handleScroll
  
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    occupation: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [speakers, setSpeakers] = useState<SpeakerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- START: Data Fetching Logic ---
  const fetchSpeakers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all speaker data from the 'speakers' table
      const { data, error } = await supabase
        .from('speakers')
        .select('*')
        .order('id', { ascending: true }); 

      if (error) throw error;

      setSpeakers(data);

    } catch (error) {
      console.error("Error fetching speakers:", error);
      toast.error("Could not load speakers. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpeakers();
  }, [fetchSpeakers]);
  // --- END: Data Fetching Logic ---

  const handleSpeakerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.gender || !formData.occupation || !formData.message) {
      toast.error("Please fill in all fields to register.");
      return;
    }
    setIsSubmitting(true);

    try {
      const registrationData: TablesInsert<"speaker_registrations"> = {
        name: formData.name,
        gender: formData.gender,
        occupation: formData.occupation,
        message: formData.message,
      };

      const { error } = await supabase.from('speaker_registrations').insert(registrationData);
      if (error) throw error;

      toast.success("Registration successful! We'll be in touch soon.");
      setFormData({ name: "", gender: "", occupation: "", message: "" });
    } catch (error: any) {
      console.error("Error submitting speaker registration:", error);
      toast.error(`Registration failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // --- START: Updated SpeakerCard Component for Image Zoom Fix ---
  const SpeakerCard = ({ speaker }: { speaker: SpeakerData }) => (
    <div 
      // Removed hover:scale-[1.03] from here
      className="flex flex-col text-center transition-all duration-300 animate-fade-in group"
    >
      {/* Image Container with Circle Effect */}
      <div className="relative mx-auto w-full max-w-[200px] mb-6">
        <div className="w-full pt-[100%] relative rounded-full overflow-hidden border-4 border-primary/50 transition-all duration-300">
          <img
            src={speaker.image_url}
            alt={speaker.name}
            // Increased the hover zoom effect on the image itself
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.15]"
            onError={(e) => {
               // Fallback to a placeholder image if the provided URL fails to load
               e.currentTarget.onerror = null; 
               e.currentTarget.src = 'https://images.unsplash.com/photo-1598550874175-4d0efbd42963?w=400&h=400&fit=crop';
               e.currentTarget.style.filter = 'grayscale(100%)';
            }}
          />
        </div>
      </div>
      
      {/* Details Section (Text remains stable) */}
      <div className="px-2">
        <h3 className="text-xl font-bold mb-1 text-foreground">
          {speaker.name}
        </h3>
        <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
          {speaker.profession}
        </p>
        <p className="text-xs text-muted-foreground mb-4 line-clamp-3 min-h-[48px]">
          {speaker.about_text}
        </p>
        
        {/* Social Links */}
        <div className="flex justify-center gap-4">
          {speaker.linkedin_url && (
            <a 
              href={speaker.linkedin_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-blue-600 transition-colors"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          )}
          {speaker.instagram_url && (
            <a 
              href={speaker.instagram_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-pink-500 transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
          )}
          {speaker.twitter_url && (
            <a 
              href={speaker.twitter_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-blue-400 transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
  // --- END: Updated SpeakerCard Component ---
  
  const SpeakerSkeleton = () => (
    <div className="flex flex-col text-center">
        <div className="relative mx-auto w-full max-w-[200px] mb-6">
            <div className="w-full pt-[100%] relative rounded-full overflow-hidden">
                <Skeleton className="absolute inset-0 w-full h-full rounded-full" />
            </div>
        </div>
        <div className="px-2 space-y-2">
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
            <div className="space-y-1 mb-4">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-11/12" />
                <Skeleton className="h-3 w-10/12 mx-auto" />
            </div>
             <div className="flex justify-center gap-4">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-4 rounded-full" />
            </div>
        </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            Our Speakers
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Meet the brilliant minds who have graced our stage with their ideas worth spreading
          </p>
        </div>
      </section>

      {/* Speakers Grid */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12 justify-items-center">
                {isLoading 
                    ? [...Array(4)].map((_, index) => <SpeakerSkeleton key={index} />)
                    : speakers.length > 0 ? (
                        speakers.map((speaker, index) => (
                            <SpeakerCard key={speaker.id} speaker={speaker} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-16 w-full">
                            <h3 className="text-2xl font-bold mb-4 text-muted-foreground">
                                No speakers found
                            </h3>
                            <p className="text-muted-foreground">
                                Please add speaker entries to the 'speakers' table in your Supabase dashboard.
                            </p>
                        </div>
                    )
                }
            </div>
        </div>
      </section>

      {/* Register as Speaker Section (Remains the same) */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 gradient-text">
            Become a Speaker
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Have an idea worth spreading? Join our community of thought leaders and inspire others with your story.
          </p>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="px-8 py-6 text-lg">
                Register as a Speaker
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Speaker Registration</DialogTitle>
                <DialogDescription>
                  Fill in your details to register as a speaker for TEDxAUC
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSpeakerRegister} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    placeholder="Enter your occupation"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message / Talk Proposal</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your idea worth spreading..."
                    className="min-h-[120px]"
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                   <DialogClose asChild>
                       <Button type="button" variant="outline">Cancel</Button>
                   </DialogClose>
                   <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Registration"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </div>
  );
};

export default Speakers;