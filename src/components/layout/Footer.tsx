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
              <span className="text-barber-gold font-playfair text-2xl font-bold">STUDIO</span>
              <span className="text-white font-playfair text-2xl font-bold">53</span>
            </div>
            <p className="text-barber-gray mb-6">
              Onde a tradição encontra o estilo. Os nossos barbeiros oferecem serviços excepcionais num ambiente relaxado e masculino.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={<Facebook size={18} />} href="#" />
              <SocialIcon 
                icon={<Instagram size={18} />} 
                href="https://www.instagram.com/duarte.thebarber/"
              />
              <SocialIcon icon={<Twitter size={18} />} href="#" />
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-playfair font-bold mb-6 gold-border-bottom pb-3">Links Rápidos</h3>
            <ul className="space-y-3">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/about" label="About" />
              <FooterLink to="/services" label="Services" />
              <FooterLink to="/booking" label="Book Now" />
              <FooterLink to="/contact" label="Contact" />
            </ul>
          </div>

          {/* Opening hours */}
          <div>
            <h3 className="text-lg font-playfair font-bold mb-6 gold-border-bottom pb-3">Horário de Funcionamento</h3>
            <ul className="space-y-3">
              <OpeningHoursRow day="Segunda - Sexta" hours="9:00 - 20:00" />
              <OpeningHoursRow day="Sábado" hours="9:00 - 18:00" />
              <OpeningHoursRow day="Domingo" hours="10:00 - 17:00" />
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-playfair font-bold mb-6 gold-border-bottom pb-3">Informações de Contacto</h3>
            <ul className="space-y-4">
              <ContactInfoRow 
                icon={<MapPin size={18} />}
                text="60 R. Cândido dos Reis, Almada, Setúbal"
              />
              <ContactInfoRow 
                icon={<Phone size={18} />}
                text="+351 966 099 867"
                link="tel:+351912345678"
              />
              <ContactInfoRow 
                icon={<Mail size={18} />}
                text="info@studio53.com"
                link="mailto:info@studio53.com"
              />
              <ContactInfoRow 
                icon={<Clock size={18} />}
                text="9:00 - 20:00"
              />
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Studio53. Todos os direitos reservados.
          </p>
          <div className="mt-4 md:mt-0">
            <Link 
              to="/legal" 
              className="text-barber-gray hover:text-barber-gold text-sm"
            >
              Política de Privacidade & Termos de Serviço
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon, href }: { icon: React.ReactNode, href?: string }) => {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="bg-barber-light h-8 w-8 rounded-full flex items-center justify-center hover:bg-barber-gold hover:text-barber-dark transition-colors duration-200"
    >
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
