import { useState } from "react";
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TablesInsert } from "@/integrations/supabase/types";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);

    try {
      const contactData: TablesInsert<"contacts"> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        message: formData.message,
      };

      const { error } = await supabase.from('contacts').insert(contactData);
      if (error) throw error;

      toast.success("Thank you for your message! We'll get back to you soon.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      toast.error(`Failed to send message: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-background to-primary/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            <h1 className="text-5xl font-bold mb-8">
              Get In <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Have questions about our events or want to collaborate? 
              We'd love to hear from you and discuss how we can work together.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="section-padding">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold mb-8">
                Send Us a <span className="gradient-text">Message</span>
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-foreground mb-2 block">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-foreground mb-2 block">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground mb-2 block">
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-medium text-foreground mb-2 block">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full resize-none"
                    placeholder="Tell us what you'd like to discuss..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full hero-button"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h2 className="text-3xl font-bold mb-8">
                Contact <span className="gradient-text">Information</span>
              </h2>

              <div className="space-y-8">
                <div className="card-glow p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <EnvelopeIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Email Us</h3>
                      <p className="text-muted-foreground mb-2">
                        Send us an email and we'll respond within 24 hours.
                      </p>
                      <a
                        href="mailto:contact@tedxauc.org"
                        className="text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        tedxamity.cg.help@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="card-glow p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <PhoneIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Call Us</h3>
                      <p className="text-muted-foreground mb-2">
                        Prefer talking directly? Give us a call during business hours.
                      </p>
                      <a
                        href="tel:+919876543210"
                        className="text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        +91 8926265583
                      </a>
                    </div>
                  </div>
                </div>

                <div className="card-glow p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPinIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
                      <p className="text-muted-foreground mb-2">
                        Come visit us at our campus location.
                      </p>
                      <p className="text-foreground font-medium">
                        Amity University Chhattisgarh<br />
                        Raipur, Chhattisgarh, India
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="section-padding bg-card/30">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-4xl font-bold mb-8">
            Follow Us on <span className="gradient-text">Social Media</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Stay connected with us for the latest updates, behind-the-scenes content, and event announcements.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: "Facebook[to  be updated]", url: "#", color: "hover:text-grey-500" },
              { name: "Instagram", url: "https://www.instagram.com/tedx.amity_university_cg/", color: "hover:text-pink-500" },
              { name: "LinkedIn", url: "https://www.linkedin.com/company/tedxamityuniversitychhattisgarh/", color: "hover:text-blue-600" },
              { name: "WhatsApp", url: "https://chat.whatsapp.com/Lbz0vFPu1VwB4lxdHBhFgj?mode=wwt", color: "hover:text-green-400" }
            ].map((social) => (
              <a
                key={social.name}
                href={social.url}
                className={`px-6 py-3 border border-border rounded-lg hover:border-primary transition-all duration-300 ${social.color} hover:scale-105`}
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
