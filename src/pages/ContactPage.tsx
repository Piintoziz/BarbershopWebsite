
import { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

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

  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-barber-dark">
        <div className="container mx-auto px-4 text-center">
          <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium">Get In Touch</h5>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-barber-gray max-w-3xl mx-auto">
            Have questions or ready to book your appointment? Reach out to us using any of the methods below, 
            and our team will be happy to assist you.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-barber">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <ContactInfoCard 
              icon={<MapPin size={32} />}
              title="Visit Us"
              info={[
                "123 Barber Street",
                "City, State 12345",
                "United States"
              ]}
            />
            <ContactInfoCard 
              icon={<Phone size={32} />}
              title="Call Us"
              info={[
                "+1 (234) 567-8900",
                "Mon-Fri: 9am - 8pm",
                "Sat-Sun: 9am - 6pm"
              ]}
            />
            <ContactInfoCard 
              icon={<Mail size={32} />}
              title="Email Us"
              info={[
                "info@elitebarber.com",
                "bookings@elitebarber.com",
                "careers@elitebarber.com"
              ]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-8 gold-border-bottom pb-3 inline-block">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">Your Name</label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="bg-barber-light border-barber-light focus:border-barber-gold"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="bg-barber-light border-barber-light focus:border-barber-gold"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(123) 456-7890"
                    className="bg-barber-light border-barber-light focus:border-barber-gold"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">Your Message</label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    rows={5}
                    required
                    className="bg-barber-light border-barber-light focus:border-barber-gold resize-none"
                  />
                </div>
                <Button type="submit" className="bg-barber-gold hover:bg-barber-gold/90 text-black">
                  Send Message
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Map */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-8 gold-border-bottom pb-3 inline-block">
                Find Us
              </h2>
              <div className="h-[400px] rounded-md overflow-hidden">
                <iframe
                  title="Elite Barber Shop Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d96714.68291250926!2d-74.05953969406828!3d40.75468158321536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2588f046ee661%3A0xa0b3281fcecc08c!2sManhattan%2C%20New%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sca!4v1680505359408!5m2!1sen!2sca"
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
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Business Hours</h2>
          <div className="max-w-md mx-auto bg-barber-light p-6 rounded-md">
            <table className="w-full">
              <tbody>
                <BusinessHourRow day="Monday" hours="9:00 AM - 8:00 PM" />
                <BusinessHourRow day="Tuesday" hours="9:00 AM - 8:00 PM" />
                <BusinessHourRow day="Wednesday" hours="9:00 AM - 8:00 PM" />
                <BusinessHourRow day="Thursday" hours="9:00 AM - 8:00 PM" />
                <BusinessHourRow day="Friday" hours="9:00 AM - 8:00 PM" />
                <BusinessHourRow day="Saturday" hours="9:00 AM - 6:00 PM" />
                <BusinessHourRow day="Sunday" hours="10:00 AM - 5:00 PM" />
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

export default ContactPage;
