import { Link } from "react-router-dom";
import { LightBulbIcon, SparklesIcon, UsersIcon, GlobeAltIcon, ArrowRightIcon } from "@heroicons/react/24/outline"; // Added more relevant icons
import tedxBrandImg from "@/assets/tedx-brand.png"; // Import the brand image
import { Button } from "@/components/ui/button";

const About = () => {
  const coreValues = [
    { icon: LightBulbIcon, text: "Igniting curiosity through groundbreaking ideas." },
    { icon: SparklesIcon, text: "Inspiring innovation within our university community." },
    { icon: UsersIcon, text: "Connecting diverse minds and fostering collaboration." },
    { icon: GlobeAltIcon, text: "Bringing global perspectives to our local stage." }
  ];

  return (
    <div className="pt-24 overflow-hidden"> {/* Added overflow-hidden */}
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-background via-background to-primary/5 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-30 translate-x-1/4 translate-y-1/4"></div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            <h1 className="text-5xl font-bold mb-8">
              Welcome to <span className="gradient-text">TEDxAUC</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We are thrilled to launch TEDx at Amity University Chhattisgarh! Our mission begins now: to spark conversation, connection, and community through <strong className="text-foreground">ideas worth spreading</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* What is TEDx? Section */}
      <section className="section-padding">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             {/* Text Column */}
             <div className="animate-fade-in lg:pr-8">
              <h2 className="text-4xl font-bold mb-6">
                What is <span className="gradient-text">TEDx?</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
                <p>
                  In the spirit of <strong className="text-foreground">ideas worth spreading</strong>, TEDx is a program of local, self-organized events that bring people together to share a TED-like experience.
                </p>
                <p>
                  At a <strong className="text-primary">TEDx</strong> event, TED Talks video and live speakers combine to spark deep discussion and connection. These local, self-organized events are branded TEDx, where <strong className="text-primary">x = independently organized TED event</strong>.
                </p>
                 <p>
                  The TED Conference provides general guidance for the TEDx program, but individual TEDx events are self-organized (subject to certain rules and regulations).
                </p>
              </div>
            </div>
            {/* Image Column */}
            <div className="animate-fade-in flex justify-center lg:justify-end" style={{animationDelay: '0.1s'}}>
              <img
                src={tedxBrandImg}
                alt="TEDx Brand Explanation"
                className="rounded-lg shadow-xl max-w-md w-full card-glow p-4 border border-border/30" // Added card-glow
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision for AUC Section */}
      <section className="section-padding bg-card/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
           <h2 className="text-4xl font-bold mb-12 animate-fade-in">
            Our <span className="gradient-text">Vision</span> for Amity Chhattisgarh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <div key={index} className="card-glow p-6 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                    <value.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-muted-foreground leading-relaxed">{value.text}</p>
              </div>
            ))}
          </div>
           <p className="text-xl text-muted-foreground leading-relaxed mt-12 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.4s'}}>
             TEDxAUC aims to be more than just an event; we aspire to be a catalyst for positive change, a hub for intellectual exploration, and a source of inspiration for every student, faculty member, and individual connected to our university. This is just the beginning.
           </p>
        </div>
      </section>


      {/* Meet the Team Snippet */}
      <section className="section-padding">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8 animate-fade-in">
           <div className="w-16 h-16 bg-card border border-border rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <UsersIcon className="h-8 w-8 text-primary" />
            </div>
          <h2 className="text-4xl font-bold mb-6">
            Meet the <span className="gradient-text">Organizers</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            TEDxAUC is brought to you by a passionate team of students and faculty from Amity University Chhattisgarh, dedicated to bringing world-class ideas to our campus.
          </p>
          <Link to="/team">
            <Button className="hero-button group">
              See Our Team
              <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>


      {/* Get Involved Section */}
      <section className="section-padding bg-gradient-to-r from-primary/10 to-primary/5 border-y border-primary/20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8 animate-fade-in">
          <h2 className="text-4xl font-bold mb-6">Be Part of the Story</h2>
          <p className="text-xl text-muted-foreground mb-8">
            This is the start of an exciting journey for TEDxAUC. Join us for our inaugural event, share your ideas, or reach out to collaborate. Let's build this platform together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/events">
              <Button className="hero-button">
                Attend Our First Event
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-primary/30 hover:border-primary hover:bg-primary/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;