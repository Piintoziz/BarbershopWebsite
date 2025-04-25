import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleScroll = () => {
    if (window.scrollY > 10) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/90 backdrop-blur-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-barber-gold font-playfair text-2xl font-bold">STUDIO</span>
          <span className="text-white font-playfair text-2xl font-bold ml-1">53</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/" label="Home" />
          <NavLink to="/services" label="Serviços" />
          <NavLink to="/about" label="Sobre" />
          <NavLink to="/contact" label="Contacto" />
          
          {!loading && (
            user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className="text-white hover:text-barber-gold transition-colors"
                >
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    <span>Minha Conta</span>
                  </div>
                </Link>
                <button 
                  onClick={signOut}
                  className="text-white hover:text-barber-gold transition-colors flex items-center"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-white hover:text-barber-gold transition-colors"
                >
                  Login
                </Link>
                <Link to="/booking">
                  <Button 
                    className="bg-barber-gold hover:bg-barber-gold/90 text-black"
                  >
                    Agendar
                  </Button>
                </Link>
              </div>
            )
          )}
        </div>
        
        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md absolute w-full">
          <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            <MobileNavLink to="/" label="Home" onClick={toggleMenu} />
            <MobileNavLink to="/services" label="Serviços" onClick={toggleMenu} />
            <MobileNavLink to="/about" label="Sobre" onClick={toggleMenu} />
            <MobileNavLink to="/contact" label="Contacto" onClick={toggleMenu} />
            
            {user ? (
              <>
                <MobileNavLink to="/dashboard" label="Minha Conta" onClick={toggleMenu} />
                <button 
                  onClick={() => {
                    signOut();
                    toggleMenu();
                  }}
                  className="text-white hover:text-barber-gold transition-colors py-2 text-left"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <MobileNavLink to="/login" label="Login" onClick={toggleMenu} />
                <MobileNavLink to="/register" label="Registar" onClick={toggleMenu} />
              </>
            )}
            
            <Link to="/booking" onClick={toggleMenu}>
              <Button 
                className="w-full mt-4 bg-barber-gold hover:bg-barber-gold/90 text-black"
              >
                Agendar
              </Button>
            </Link>
            
            <div className="pt-4 mt-4 border-t border-gray-700 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-barber-gold" />
              <a href="tel:+351912345678" className="text-white">
                +351 912 345 678
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Desktop Nav Link
const NavLink = ({ to, label }: { to: string; label: string }) => (
  <Link 
    to={to} 
    className="text-white hover:text-barber-gold transition-colors"
  >
    {label}
  </Link>
);

// Mobile Nav Link
const MobileNavLink = ({ to, label, onClick }: { to: string; label: string; onClick: () => void }) => (
  <Link 
    to={to} 
    className="text-white hover:text-barber-gold transition-colors py-2"
    onClick={onClick}
  >
    {label}
  </Link>
);

export default Navbar;
