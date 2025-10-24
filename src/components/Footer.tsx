import { Link } from "react-router-dom";
import tedxaucLogo from "@/assets/tedxauc-logo.jpg";
import amityLogo from "@/assets/amity-logo.png";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center space-y-8 md:space-y-0 md:space-x-12">
          <div className="flex items-center space-x-6">
            <img className="h-16 w-auto" src={tedxaucLogo} alt="TEDxAUC" />
            <img className="h-16 w-auto" src={amityLogo} alt="Amity University" />
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-primary">Navigate</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link></li>
                <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link to="/team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Team</Link></li>
                <li><Link to="/events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Events</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-primary">Support</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link to="/donate" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Donate</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-primary">Connect</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Facebook</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Instagram</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">LinkedIn</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Twitter</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-primary">Legal</h3>
              <ul className="mt-4 space-y-2">
                {/* --- UPDATED LINKS --- */}
                <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
                <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link to="/refund-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <p className="text-xs text-muted-foreground">
              &copy; 2024 TEDxAUC, Amity University Chhattisgarh. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              This independent TEDx event is operated under license from TED.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
