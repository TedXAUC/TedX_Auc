import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bars3Icon, XMarkIcon, UserCircleIcon } from "@heroicons/react/24/outline";
// === UPDATED LOGO URL ===
const siteLogo = "https://lehpiptexuxbnxgdunmc.supabase.co/storage/v1/object/public/assets/amity%20site%20logo.png";
// === END UPDATE ===
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Team", href: "/team" },
  { name: "Speakers", href: "/speakers" },
  { name: "Events", href: "/events" },
  { name: "Contact", href: "/contact" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-background/95 backdrop-blur-sm border-b border-border/50" : "bg-transparent"
    }`}>
      <nav className="mx-auto max-w-7xl flex items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          {/* === UPDATED LOGO IMPLEMENTATION === */}
          <Link to="/" className="-m-1.5 p-1.5 flex items-center space-x-3">
            <img className="h-12 w-auto" src={siteLogo} alt="Site Logo" />
            {/* Removed the TEDxAUC text span */}
          </Link>
          {/* === END UPDATE === */}
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-semibold leading-6 transition-all duration-300 hover:text-primary relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left ${
                isActive(item.href) ? "text-primary after:scale-x-100" : "text-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center space-x-4">
          {user ? (
            <Link to="/profile">
              <Button variant="ghost" className="flex items-center gap-2">
                <UserCircleIcon className="h-6 w-6" />
                Profile
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="ghost">
                Login
              </Button>
            </Link>
          )}
          <Link
            to="/donate"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Donate
          </Link>
        </div>
      </nav>

      {/* Mobile menu using Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xs p-0 border-l border-border/50 [&>button]:hidden">
          <div className="flex items-center justify-between p-6">
            {/* === UPDATED MOBILE LOGO IMPLEMENTATION === */}
            <Link to="/" className="-m-1.5 p-1.5 flex items-center space-x-3">
              <img className="h-8 w-auto" src={siteLogo} alt="Site Logo" />
              {/* Removed the TEDxAUC text span */}
            </Link>
            {/* === END UPDATE === */}
            <SheetClose className="rounded-md p-2.5 text-foreground hover:text-primary transition-colors">
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </SheetClose>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-border/50">
              <div className="space-y-2 py-6 px-6">
                {navigation.map((item) => (
                  <SheetClose asChild key={item.name}>
                    <Link
                      to={item.href}
                      className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 transition-all duration-300 hover:bg-muted ${
                        isActive(item.href) ? "text-primary bg-muted" : "text-foreground"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </SheetClose>
                ))}
              </div>
              <div className="py-6 px-6 space-y-4">
                {user ? (
                  <SheetClose asChild>
                    <Link to="/profile" className="block text-center" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Profile
                      </Button>
                    </Link>
                  </SheetClose>
                ) : (
                  <SheetClose asChild>
                    <Link to="/login" className="block text-center" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Login / Sign Up
                      </Button>
                    </Link>
                  </SheetClose>
                )}
                <SheetClose asChild>
                  <Link
                    to="/donate"
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors block text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Donate
                  </Link>
                </SheetClose>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};
