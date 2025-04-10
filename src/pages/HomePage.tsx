
import { ArrowRight, Calendar, Check, Scissors, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HomePage = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section min-h-screen flex items-center relative">
        <div className="container mx-auto px-4 py-12 z-10">
          <div className="max-w-3xl">
            <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium">Welcome to Elite Barber Shop</h5>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Exceptional Haircuts & Grooming for Gentlemen
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-lg">
              Experience the art of grooming with our skilled barbers, premium products, 
              and relaxed atmosphere. Look sharp, feel confident.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-barber-gold hover:bg-barber-gold/90 text-black">
                <Link to="/booking">
                  Book Appointment
                  <Calendar className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link to="/services">
                  View Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-barber to-transparent"></div>
      </section>

      {/* Services Preview */}
      <section className="bg-barber section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Signature Services</h2>
            <div className="h-1 w-24 bg-barber-gold mx-auto"></div>
            <p className="mt-6 text-barber-gray max-w-2xl mx-auto">
              We offer a range of premium grooming services tailored to meet your needs.
              Each service is performed by our skilled barbers with meticulous attention to detail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard 
              title="Classic Haircut"
              price={35}
              description="Traditional haircut with attention to detail, including hot towel and styling."
              imageUrl="/service-haircut.jpg"
            />
            <ServiceCard 
              title="Beard Trim"
              price={25}
              description="Expert beard shaping and trimming to maintain your perfect look."
              imageUrl="/service-beard.jpg"
            />
            <ServiceCard 
              title="Hot Shave"
              price={40}
              description="Luxurious hot towel shave using straight razor and premium products."
              imageUrl="/service-shave.jpg"
            />
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" className="border-barber-gold text-barber-gold hover:bg-barber-gold hover:text-black">
              <Link to="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="bg-barber-dark section-padding">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium">About Us</h5>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                A Tradition of Excellence Since 1995
              </h2>
              <p className="text-barber-gray mb-6">
                Elite Barber Shop was founded with a mission to revive the art of traditional 
                barbering while embracing modern styles and techniques. For over 25 years, 
                we have been dedicated to providing exceptional grooming services in an 
                environment that celebrates masculinity and sophistication.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Expert barbers with 10+ years of experience",
                  "Premium products and tools",
                  "Relaxing atmosphere with complimentary drinks",
                  "Attention to detail in every service"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-3 text-barber-gold"><Check size={20} /></span>
                    <span className="text-barber-gray">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="bg-barber-gold hover:bg-barber-gold/90 text-black">
                <Link to="/about">Learn More About Us</Link>
              </Button>
            </div>
            <div className="mt-8 lg:mt-0">
              <div className="relative">
                <div className="absolute inset-0 border-2 border-barber-gold -translate-x-5 translate-y-5 z-0"></div>
                <img 
                  src="/about-barber.jpg" 
                  alt="Barber at work" 
                  className="relative z-10 w-full object-cover h-[500px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-barber section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Elite Barber</h2>
            <div className="h-1 w-24 bg-barber-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Scissors />}
              title="Expert Barbers"
              description="Our team consists of skilled professionals with years of experience in modern and traditional techniques."
            />
            <FeatureCard 
              icon={<Star />}
              title="Premium Products"
              description="We use only high-quality grooming products that ensure the best results for your hair and skin."
            />
            <FeatureCard 
              icon={<Calendar />}
              title="Easy Booking"
              description="Book your appointment online with our convenient scheduling system, available 24/7."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-barber-gold py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">Ready for a Fresh Look?</h2>
          <p className="text-barber-dark mb-8 max-w-2xl mx-auto">
            Book your appointment today and experience the Elite Barber difference. 
            Our skilled team is ready to help you look your best.
          </p>
          <Button asChild size="lg" className="bg-black hover:bg-black/90 text-white">
            <Link to="/booking">
              Book Your Appointment
              <Calendar className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
};

const ServiceCard = ({ 
  title, 
  price, 
  description, 
  imageUrl 
}: { 
  title: string; 
  price: number; 
  description: string; 
  imageUrl: string;
}) => {
  return (
    <div className="bg-barber-light p-6 rounded-md transition-transform duration-300 hover:-translate-y-2">
      <div className="relative h-48 mb-4 overflow-hidden rounded-md">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold">{title}</h3>
        <span className="text-barber-gold font-bold">${price}</span>
      </div>
      <p className="text-barber-gray mb-4">{description}</p>
      <Button asChild variant="link" className="text-barber-gold p-0 hover:text-barber-gold/80">
        <Link to="/booking">
          Book Now
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
};

const FeatureCard = ({ 
  icon,
  title, 
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="bg-barber-light p-6 rounded-md text-center">
      <div className="mx-auto w-16 h-16 bg-barber-gold rounded-full flex items-center justify-center text-black mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-barber-gray">{description}</p>
    </div>
  );
};

export default HomePage;
