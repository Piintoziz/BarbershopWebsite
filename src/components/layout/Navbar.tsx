
import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-barber shadow-lg py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-barber-gold font-playfair text-2xl font-bold">ELITE</span>
          <span className="text-white font-playfair ml-1 text-lg">BARBER</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" label="Home" />
          <NavLink to="/about" label="About" />
          <NavLink to="/services" label="Services" />
          <NavLink to="/contact" label="Contact" />
          <Button asChild variant="outline" className="border-barber-gold text-barber-gold hover:bg-barber-gold hover:text-black">
            <Link to="/booking">Book Now</Link>
          </Button>
        </nav>

        {/* Mobile Call Now Button */}
        <div className="md:hidden flex items-center">
          <a href="tel:+12345678900" className="mr-6">
            <Phone className="h-5 w-5 text-barber-gold" />
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-barber shadow-lg animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              <MobileNavLink to="/" label="Home" onClick={() => setIsOpen(false)} />
              <MobileNavLink to="/about" label="About" onClick={() => setIsOpen(false)} />
              <MobileNavLink to="/services" label="Services" onClick={() => setIsOpen(false)} />
              <MobileNavLink to="/contact" label="Contact" onClick={() => setIsOpen(false)} />
              <Button asChild variant="outline" className="border-barber-gold text-barber-gold hover:bg-barber-gold hover:text-black w-full">
                <Link to="/booking" onClick={() => setIsOpen(false)}>Book Now</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const NavLink = ({ to, label }: { to: string; label: string }) => {
  return (
    <Link 
      to={to} 
      className="text-white hover:text-barber-gold transition-colors duration-200 font-medium"
    >
      {label}
    </Link>
  );
};

const MobileNavLink = ({ to, label, onClick }: { to: string; label: string; onClick: () => void }) => {
  return (
    <Link 
      to={to} 
      className="text-white hover:text-barber-gold transition-colors duration-200 py-2 block text-lg"
      onClick={onClick}
    >
      {label}
    </Link>
  );
};

export default Navbar;
