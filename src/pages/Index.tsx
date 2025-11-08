import { Link } from "react-router-dom";
import { ArrowRightIcon, CalendarDaysIcon, ClockIcon, LightBulbIcon, SparklesIcon, UsersIcon } from "@heroicons/react/24/outline"; // Added/adjusted icons
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Assume images are placed in src/assets
import majorImg from "@/assets/major.jpeg";
import nilimaImg from "@/assets/nilima-roy.jpeg";
import ruchiImg from "@/assets/ruchi.jpeg";
import duggalImg from "@/assets/s-duggal.jpg";
import tedxBrandImg from "@/assets/tedx-brand.png"; // Import the brand image

// Speaker data remains the same
const upcomingEventSpeakers = [
  {
    name: "Major General Rajpal Punia (Retd.)",
    role: "Guest of Honour",
    profession: "War Veteran & Author",
    bio: "Led India's Counter-Terror Operations in J&K, Gallantry Awardee (KSM), and a renowned author and motivator.",
    image: majorImg,
  },
  {
    name: "Dr. Nilima Roy Chowdhury",
    role: "Speaker",
    profession: "FaithTech Startup Founder",
    bio: "3x TEDx & Josh Talks Speaker, Mentor at WEP, NITI Aayog, and a Corporate Wellness Coach.",
    image: nilimaImg,
  },
  {
    name: "Ruchi Gour Mehta",
    role: "Speaker",
    profession: "Finance Leader",
    bio: "Formerly with ITC, Amazon, Myntra, Swiggy & Dream Sports, specializing in business finance and governance.",
    image: ruchiImg,
  },
  {
    name: "Saakshar Duggal",
    role: "Speaker",
    profession: "AI Governance & Law Expert",
    bio: "22x TEDx Speaker, Cybercrime Lawyer, Forbes Council Member, and a United Nations Contributor.",
    image: duggalImg,
  },
];


const Index = () => {
  return (
    <div className="overflow-hidden">
      {/* --- SECTION 1: Hero Section --- */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>

        <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-8 animate-fade-in">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-6xl font-bold tracking-tight sm:text-8xl mb-6">
              <span className="gradient-text">Ideas Worth</span>
              <br />
              <span className="text-foreground">Spreading</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Join us at TEDxAUC for our inaugural event featuring inspiring talks, innovative ideas, and transformative experiences. Where great minds meet to shape the future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/events">
                <Button className="hero-button group">
                  Explore The Event
                  <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
      </section>
      {/* --- END Hero Section --- */}


      {/* --- SECTION 2: Explore Our Upcoming Event --- */}
      <section className="section-padding bg-card/30 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">
              Explore Our Upcoming <span className="gradient-text">Event</span>
            </h2>
            <p className="text-2xl font-semibold text-foreground mb-2">
              Beyond Boundaries
            </p>
            <div className="flex items-center justify-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                    <CalendarDaysIcon className="h-5 w-5"/>
                    <span>12th Nov</span>
                </div>
                <div className="flex items-center gap-1">
                    <ClockIcon className="h-5 w-5"/>
                    <span>10:30 AM onwards</span>
                </div>
            </div>
          </div>

          <TooltipProvider delayDuration={100}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {upcomingEventSpeakers.map((speaker, index) => (
                <Tooltip key={speaker.name}>
                  <TooltipTrigger asChild>
                    <div
                      className="group flex flex-col items-center text-center cursor-default animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative w-40 h-40 mb-4">
                        <img
                          src={speaker.image}
                          alt={speaker.name}
                          className="w-full h-full object-cover rounded-full border-4 border-primary/20 group-hover:border-primary transition-all duration-300 group-hover:scale-105"
                        />
                         <span className="absolute bottom-1 right-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md leading-tight">
                          {speaker.role}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1 group-hover:gradient-text transition-colors">
                        {speaker.name}
                      </h3>
                      <p className="text-sm text-primary font-medium">
                        {speaker.profession}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="center"
                    className="max-w-xs text-center p-3 bg-popover text-popover-foreground border border-border shadow-lg rounded-md"
                  >
                    <p className="text-sm">{speaker.bio}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>

           <div className="text-center mt-16">
             <Link to="/events">
               <Button variant="outline" className="border-primary/30 hover:border-primary hover:bg-primary/10 group">
                 Learn More & Book Tickets
                 <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
               </Button>
             </Link>
           </div>
        </div>
      </section>
      {/* --- END Upcoming Event SECTION --- */}


      {/* --- SECTION 3: What is TEDxAUC? --- */}
      <section className="section-padding">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Column */}
            <div className="animate-fade-in">
              <img
                src={tedxBrandImg}
                alt="TEDxAUC Brand Explanation"
                className="rounded-lg shadow-lg mx-auto lg:mx-0 max-w-md w-full"
              />
            </div>
            {/* Text Column */}
            <div className="animate-fade-in lg:pl-8" style={{animationDelay: '0.1s'}}>
              <h2 className="text-4xl font-bold mb-6">
                What is <span className="gradient-text">TEDxAUC?</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
                <p>
                  In the spirit of <strong className="text-foreground">ideas worth spreading</strong>, TEDx is a program of local, self-organized events that bring people together to share a TED-like experience.
                </p>
                <p>
                  At a <strong className="text-primary">TEDx</strong> event, TED Talks video and live speakers combine to spark deep discussion and connection. These local, self-organized events are branded TEDx, where <strong className="text-primary">x = independently organized TED event</strong>.
                </p>
                <p>
                  TEDxAUC brings this global movement to Amity University Chhattisgarh, creating a unique platform for our community's brightest minds.
                </p>
              </div>
               <Link to="/about" className="mt-8 inline-block">
                <Button variant="outline" className="border-primary/30 hover:border-primary hover:bg-primary/10 group">
                  Discover Our Story
                  <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* --- END What is TEDxAUC? --- */}


      {/* --- SECTION 4: Join the Movement (Combined Mission & CTA) --- */}
       <section className="section-padding bg-gradient-to-r from-primary/10 to-primary/5 border-y border-primary/20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8 animate-fade-in">
           <div className="w-16 h-16 bg-card border border-border rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <SparklesIcon className="h-8 w-8 text-primary" /> {/* Changed Icon */}
            </div>
          <h2 className="text-4xl font-bold mb-6">Join the Movement</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Our mission is to foster innovation, creativity, and intellectual growth within our university. Be part of something extraordinary and help us spread ideas worth sharing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/events">
              <Button className="hero-button">
                Get Your Ticket
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-primary/30 hover:border-primary hover:bg-primary/10">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* --- END Join the Movement --- */}
    </div>
  );
};

export default Index;
