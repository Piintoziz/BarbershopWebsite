
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Clock, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-barber-dark text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and about */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-barber-gold font-playfair text-2xl font-bold">ELITE</span>
              <span className="text-white font-playfair ml-1 text-lg">BARBER</span>
            </div>
            <p className="text-barber-gray mb-6">
              Where tradition meets style. Our skilled barbers deliver exceptional services in a relaxed, masculine environment.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={<Facebook size={18} />} />
              <SocialIcon icon={<Instagram size={18} />} />
              <SocialIcon icon={<Twitter size={18} />} />
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-playfair font-bold mb-6 gold-border-bottom pb-3">Quick Links</h3>
            <ul className="space-y-3">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/about" label="About" />
              <FooterLink to="/services" label="Services" />
              <FooterLink to="/booking" label="Book Now" />
              <FooterLink to="/contact" label="Contact" />
              <FooterLink to="/admin" label="Admin" />
            </ul>
          </div>

          {/* Opening hours */}
          <div>
            <h3 className="text-lg font-playfair font-bold mb-6 gold-border-bottom pb-3">Opening Hours</h3>
            <ul className="space-y-3">
              <OpeningHoursRow day="Monday - Friday" hours="9:00 AM - 8:00 PM" />
              <OpeningHoursRow day="Saturday" hours="9:00 AM - 6:00 PM" />
              <OpeningHoursRow day="Sunday" hours="10:00 AM - 5:00 PM" />
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-playfair font-bold mb-6 gold-border-bottom pb-3">Contact Info</h3>
            <ul className="space-y-4">
              <ContactInfoRow 
                icon={<MapPin size={18} />}
                text="123 Barber Street, City, State, 12345"
              />
              <ContactInfoRow 
                icon={<Phone size={18} />}
                text="+1 (234) 567-8900"
                link="tel:+12345678900"
              />
              <ContactInfoRow 
                icon={<Mail size={18} />}
                text="info@elitebarber.com"
                link="mailto:info@elitebarber.com"
              />
              <ContactInfoRow 
                icon={<Clock size={18} />}
                text="9:00 AM - 8:00 PM"
              />
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-barber-gray text-sm">
            © {new Date().getFullYear()} Elite Barber. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-6">
              <li>
                <Link to="/privacy" className="text-barber-gray hover:text-barber-gold text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-barber-gray hover:text-barber-gold text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon }: { icon: React.ReactNode }) => {
  return (
    <a href="#" className="bg-barber-light h-8 w-8 rounded-full flex items-center justify-center hover:bg-barber-gold hover:text-barber-dark transition-colors duration-200">
      {icon}
    </a>
  );
};

const FooterLink = ({ to, label }: { to: string, label: string }) => {
  return (
    <li>
      <Link to={to} className="text-barber-gray hover:text-barber-gold transition-colors duration-200">
        {label}
      </Link>
    </li>
  );
};

const OpeningHoursRow = ({ day, hours }: { day: string, hours: string }) => {
  return (
    <li className="flex justify-between">
      <span className="text-barber-gray">{day}</span>
      <span className="text-white">{hours}</span>
    </li>
  );
};

const ContactInfoRow = ({ 
  icon, 
  text,
  link
}: { 
  icon: React.ReactNode, 
  text: string,
  link?: string
}) => {
  const content = (
    <div className="flex items-start">
      <span className="text-barber-gold mr-3 mt-1">{icon}</span>
      <span className="text-barber-gray">{text}</span>
    </div>
  );

  return (
    <li>
      {link ? (
        <a href={link} className="hover:text-barber-gold transition-colors duration-200">
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  );
};

export default Footer;
