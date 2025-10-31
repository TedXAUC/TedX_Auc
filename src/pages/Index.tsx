import { Link } from "react-router-dom";
import { ArrowRightIcon, CalendarDaysIcon, ClockIcon, LightBulbIcon, SparklesIcon, UsersIcon, MicrophoneIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline"; // Added MicrophoneIcon, QuestionMarkCircleIcon
import { Button } from "@/components/ui/button";
// Tooltip imports are commented out as they are not used in the new section
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// Speaker images are commented out
// import majorImg from "@/assets/major.jpeg";
// import nilimaImg from "@/assets/nilima-roy.jpeg";
// import ruchiImg from "@/assets/ruchi.jpeg";
// import duggalImg from "@/assets/s-duggal.jpg";
import tedxBrandImg from "@/assets/tedx-brand.png"; // Keep this import

// Speaker data is commented out
// const upcomingEventSpeakers = [ ... ];


const Index = () => {
  return (
    <div className="overflow-hidden">
      {/* --- SECTION 1: Hero Section (Unchanged) --- */}
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


      {/* --- SECTION 2: Speakers Coming Soon - More Appealing Placeholder --- */}
      <section className="section-padding bg-card/30 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">
              Meet Our Inspiring <span className="gradient-text">Speakers</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-16 max-w-2xl mx-auto">
              Four unique voices, four powerful ideas. Prepare to be inspired. The reveal is just around the corner!
            </p>

            {/* Placeholder Visual with 4 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="group relative aspect-[3/4] rounded-lg overflow-hidden card-glow border border-border/30 animate-fade-in hover:scale-105 hover:shadow-primary/20 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Subtle Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-primary/10 opacity-60 group-hover:opacity-80 transition-opacity"></div>

                  {/* Question Mark Icon */}
                  <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
                    <QuestionMarkCircleIcon className="h-16 w-16 text-primary/50 group-hover:text-primary transition-colors duration-300 mb-4 opacity-50 group-hover:opacity-80 group-hover:scale-110" />
                    <h3 className="text-lg font-semibold text-foreground/80 group-hover:text-foreground transition-colors">Speaker {index + 1}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Reveal Coming Soon</p>
                  </div>

                  {/* Animated Glow Effect on Hover */}
                  <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/50 transition-all duration-300 scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 animate-pulse group-hover:animate-none"></div>
                </div>
              ))}
            </div>

             <div className="mt-16">
               <Link to="/speakers">
                 <Button variant="outline" className="border-primary/30 hover:border-primary hover:bg-primary/10 group">
                   Stay Updated for the Reveal
                   <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                 </Button>
              </Link>
             </div>
          </div>
        </div>
      </section>
      {/* --- END Speakers Coming Soon --- */}


      {/* --- ORIGINAL SECTION 2 (Commented Out) --- */}
      {/*
      <section className="section-padding bg-card/30 border-y border-border/50">
        ... original speaker section code ...
      </section>
      */}
      {/* --- END Original Upcoming Event SECTION --- */}


      {/* --- SECTION 3: What is TEDxAUC? (Unchanged) --- */}
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


      {/* --- SECTION 4: Join the Movement (Unchanged) --- */}
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