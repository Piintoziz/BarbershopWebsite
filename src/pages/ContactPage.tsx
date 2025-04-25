import { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { getBusinessHours } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Type for the raw data coming from Supabase table
interface BusinessHourRowData {
  day_of_week: string; // e.g., 'monday', 'tuesday'
  open_time: string;
  close_time: string;
  is_open: boolean;
}

// Keep the desired format for the state
type BusinessHoursData = Record<string, { open: string; close: string; isOpen: boolean }>;

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // State for dynamic business hours
  const [businessHours, setBusinessHours] = useState<BusinessHoursData | null>(null);
  const [isLoadingHours, setIsLoadingHours] = useState(true);
  const [hoursError, setHoursError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send this data to a server
    console.log('Form submitted:', formData);
    
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });
    
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
  };

  // Fetch business hours on component mount
  useEffect(() => {
    const fetchHours = async () => {
      setIsLoadingHours(true);
      setHoursError(null);
      try {
        // Fetch raw data (array of objects)
        const { data: rawData, error } = await getBusinessHours(); 
        if (error) throw error;

        // Check if rawData is an array and has items
        if (Array.isArray(rawData) && rawData.length > 0) {
          // Transform the array into the desired Record format
          const formattedHours: BusinessHoursData = rawData.reduce((acc, row: BusinessHourRowData) => {
            acc[row.day_of_week] = { 
              open: row.open_time, 
              close: row.close_time, 
              isOpen: row.is_open 
            };
            return acc;
          }, {} as BusinessHoursData); // Initialize accumulator as BusinessHoursData
          
          setBusinessHours(formattedHours);

        } else {
          console.warn("Dados de horário recebidos inválidos ou vazios:", rawData);
          setBusinessHours(null); 
        }
      } catch (err: any) {
        console.error("Erro ao buscar horário de funcionamento:", err);
        setHoursError("Não foi possível carregar o horário. Tente novamente mais tarde.");
        setBusinessHours(null);
      } finally {
        setIsLoadingHours(false);
      }
    };

    fetchHours();
  }, []);

  // Helper to get Portuguese day name 
  const dayOrder: { [key: string]: 0 | 1 | 2 | 3 | 4 | 5 | 6 } = { // Explicit Day type
     monday: 1,
     tuesday: 2,
     wednesday: 3,
     thursday: 4,
     friday: 5,
     saturday: 6,
     sunday: 0 
  };

  const getDayName = (dayKey: string): string => {
     const index = dayOrder[dayKey];
     // Ensure index is of type Day (0-6) before passing
     if (index !== undefined) { 
         // Use type assertion if confident index is always 0-6
         return ptBR.localize?.day(index as (0 | 1 | 2 | 3 | 4 | 5 | 6), { width: 'wide' }) || dayKey;
     }
     return dayKey; // Fallback
  };

  // Sort business hours by dayOrder for consistent display
  const sortedBusinessHours = businessHours 
       ? Object.entries(businessHours).sort(([dayA], [dayB]) => (dayOrder[dayA] ?? 7) - (dayOrder[dayB] ?? 7))
       : [];

  const contactEmails = {
    general: "info@studio53.com",
    bookings: "bookings@studio53.com",
    careers: "careers@studio53.com"
  };

  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-barber-dark">
        <div className="container mx-auto px-4 text-center">
          <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium">Fale Connosco</h5>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contactos</h1>
          <p className="text-barber-gray max-w-3xl mx-auto">
            Tens alguma questão ou queres marcar o teu horário? Entra em contacto connosco através de qualquer 
            um dos métodos abaixo, e a nossa equipa terá todo o gosto em te ajudar.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-barber">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <ContactInfoCard 
              icon={<MapPin size={32} />}
              title="Localização"
              info={[
                "60 R. Cândido dos Reis",
                "Almada, Setúbal",
                "Portugal"
              ]}
            />
            <ContactInfoCard 
              icon={<Phone size={32} />}
              title="Telefone"
              info={[
                "+351 966 099 867",
                "Seg-Sex: 9:00 - 20:00",
                "Sáb-Dom: 9:00 - 18:00"
              ]}
            />
            <ContactInfoCard 
              icon={<Mail size={32} />}
              title="Email"
              info={[
                "info@studio53.com",
                "marcacoes@studio53.com",
                "carreiras@studio53.com"
              ]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-8 gold-border-bottom pb-3 inline-block">
                Envie-nos uma Mensagem
              </h2>
              <ContactForm />
            </div>

            {/* Map */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-8 gold-border-bottom pb-3 inline-block">
                Encontre-nos
              </h2>
              <div className="h-[400px] rounded-md overflow-hidden">
                <iframe
                  title="Localização do Studio53"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3113.123456789012!2d-9.1581234!3d38.6789012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd1934a123456789%3A0x987654321!2s60%20R.%20C%C3%A2ndido%20dos%20Reis%2C%20Almada%2C%20Set%C3%BAbal!5e0!3m2!1spt-PT!2spt!4v1234567890!5m2!1spt-PT!2spt"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="py-16 bg-barber-dark">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Horário de Funcionamento</h2>
          <div className="max-w-md mx-auto bg-barber-light p-6 rounded-md">
            <table className="w-full">
              <tbody>
                {isLoadingHours && (
                  <tr><td colSpan={2} className="text-center py-4 text-barber-gray">A carregar horário...</td></tr>
                )}
                {hoursError && (
                   <tr><td colSpan={2} className="text-center py-4 text-red-500">{hoursError}</td></tr>
                )}
                {!isLoadingHours && !hoursError && sortedBusinessHours.length > 0 && (
                   sortedBusinessHours.map(([dayKey, hours]) => (
                     <BusinessHourRow 
                       key={dayKey} 
                       day={getDayName(dayKey)} 
                       hours={hours.isOpen 
                          ? `${hours.open.substring(0, 5)} - ${hours.close.substring(0, 5)}` 
                          : 'Fechado'}
                     />
                   ))
                )}
                 {!isLoadingHours && !hoursError && sortedBusinessHours.length === 0 && (
                     <tr><td colSpan={2} className="text-center py-4 text-barber-gray">Horário indisponível.</td></tr>
                 )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
};

const ContactInfoCard = ({
  icon,
  title,
  info
}: {
  icon: React.ReactNode;
  title: string;
  info: string[];
}) => {
  return (
    <div className="bg-barber-light p-6 rounded-md text-center">
      <div className="mx-auto w-16 h-16 bg-barber-gold rounded-full flex items-center justify-center text-black mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="space-y-2">
        {info.map((line, index) => (
          <p key={index} className="text-barber-gray">{line}</p>
        ))}
      </div>
    </div>
  );
};

const BusinessHourRow = ({ day, hours }: { day: string; hours: string }) => {
  return (
    <tr className="border-b border-barber">
      <td className="py-3 text-left text-barber-gray">{day}</td>
      <td className="py-3 text-right">{hours}</td>
    </tr>
  );
};

const ContactForm = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Nome Completo
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="w-full px-4 py-2 bg-barber-light border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-barber-gold"
          placeholder="Insira o seu nome"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="w-full px-4 py-2 bg-barber-light border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-barber-gold"
          placeholder="Insira o seu email"
          required
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-2">
          Telefone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className="w-full px-4 py-2 bg-barber-light border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-barber-gold"
          placeholder="Insira o seu número de telefone"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Mensagem
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full px-4 py-2 bg-barber-light border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-barber-gold"
          placeholder="Como podemos ajudar?"
          required
        ></textarea>
      </div>
      <Button type="submit" className="w-full bg-barber-gold hover:bg-barber-gold/90 text-black">
        Enviar Mensagem
      </Button>
    </form>
  );
};

export default ContactPage;
