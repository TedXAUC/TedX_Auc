import { Link } from "react-router-dom";
// === REMOVED TEDx LOGO IMPORT ===
import amityLogo from "@/assets/amity-logo.png";
// === NEW LOGO URL ===
const siteLogo = "https://lehpiptexuxbnxgdunmc.supabase.co/storage/v1/object/public/assets/amity%20site%20logo.png";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center space-y-8 md:space-y-0 md:space-x-12">
          {/* === UPDATED LOGOS IN FOOTER === */}
          <div className="flex items-center space-x-6">
            <img
              className="h-16 w-auto"
              src={siteLogo} // Use the new site logo URL
              alt="Site Logo"
            />
            <img className="h-16 w-auto" src={amityLogo} alt="Amity University" /> {/* Keep Amity logo */}
          </div>
          {/* === END UPDATE === */}

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
                
                <li><a href="https://www.instagram.com/tedx.amity_university_cg/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Instagram</a></li>
                <li><a href="https://www.linkedin.com/company/tedxamityuniversitychhattisgarh/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">LinkedIn</a></li>
                <li><a href="https://chat.whatsapp.com/Lbz0vFPu1VwB4lxdHBhFgj?mode=wwt" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Whatsapp</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-primary">Legal</h3>
              <ul className="mt-4 space-y-2">
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
              &copy; 2025 TEDxAUC, Amity University Chhattisgarh. All rights reserved.
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
