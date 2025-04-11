
import { useState, useEffect } from 'react';
import { Menu, X, Phone, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Check user authentication status
    const checkAuth = () => {
      const userAuth = localStorage.getItem('userAuthenticated');
      setIsAuthenticated(userAuth === 'true');
    };

    checkAuth();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    navigate('/');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#111111] shadow-lg py-2' : 'bg-transparent py-4'
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
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <NavLink to="/booking" label="My Bookings" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center text-barber-gray hover:text-barber-gold"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" className="text-barber-gray hover:text-white">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="border-barber-gold text-barber-gold hover:bg-barber-gold hover:text-black">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
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
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#111111] shadow-lg animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              <MobileNavLink to="/" label="Home" onClick={() => setIsOpen(false)} />
              <MobileNavLink to="/about" label="About" onClick={() => setIsOpen(false)} />
              <MobileNavLink to="/services" label="Services" onClick={() => setIsOpen(false)} />
              <MobileNavLink to="/contact" label="Contact" onClick={() => setIsOpen(false)} />
              
              {isAuthenticated ? (
                <>
                  <MobileNavLink to="/booking" label="My Bookings" onClick={() => setIsOpen(false)} />
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center text-barber-gray hover:text-barber-gold py-3"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    asChild 
                    variant="ghost" 
                    className="text-barber-gray hover:text-white justify-start py-3"
                  >
                    <Link to="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline" 
                    className="border-barber-gold text-barber-gold hover:bg-barber-gold hover:text-black w-full"
                  >
                    <Link to="/register" onClick={() => setIsOpen(false)}>Register</Link>
                  </Button>
                </>
              )}
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
