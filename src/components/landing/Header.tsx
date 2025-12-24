import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <BookOpen className="w-5 h-5 text-background" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              EduBits
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-secondary rounded-full p-1">
            <a 
              href="#how-it-works" 
              className="nav-pill text-muted-foreground hover:text-foreground"
            >
              How It Works
            </a>
            <a 
              href="#features" 
              className="nav-pill text-muted-foreground hover:text-foreground"
            >
              Features
            </a>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-card"
          >
            <div className="container px-4 py-4 space-y-4">
              <a 
                href="#how-it-works" 
                className="block text-foreground py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <a 
                href="#features" 
                className="block text-foreground py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <div className="pt-4 space-y-2 border-t border-border">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/dashboard">Get Started</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
