
import { Award, Clock, Users, Scissors, Star, Check } from 'lucide-react';

const AboutPage = () => {
  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-barber-dark">
        <div className="container mx-auto px-4 text-center">
          <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium">Who We Are</h5>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Elite Barber</h1>
          <p className="text-barber-gray max-w-3xl mx-auto">
            Elite Barber is a premium grooming destination where tradition meets modern expertise, 
            creating an unparalleled experience for gentlemen who value quality and style.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-barber">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium">Our Story</h5>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">A Legacy of Excellence Since 1995</h2>
              <p className="text-barber-gray mb-6">
                Founded in 1995 by master barber James Elliott, Elite Barber began with a vision to create a space where men could experience exceptional grooming services in a relaxed, masculine environment. What started as a small two-chair shop has grown into a respected establishment known for its commitment to quality, attention to detail, and unparalleled customer service.
              </p>
              <p className="text-barber-gray mb-6">
                Over the years, we've remained true to our founding principles while embracing innovation and modern techniques. Our barbers combine time-honored traditions with contemporary styles to deliver results that exceed expectations.
              </p>
              <p className="text-barber-gray">
                Today, Elite Barber continues to be a cornerstone of the community, where gentlemen of all ages come not just for a haircut, but for an experience that makes them look and feel their best.
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 border-2 border-barber-gold translate-x-5 translate-y-5 z-0"></div>
                <img 
                  src="/about-story.jpg" 
                  alt="Barber shop history" 
                  className="relative z-10 w-full h-[400px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-barber-dark">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard 
              icon={<Users size={32} />}
              value="15k+"
              label="Happy Clients"
            />
            <StatCard 
              icon={<Scissors size={32} />}
              value="4"
              label="Expert Barbers"
            />
            <StatCard 
              icon={<Award size={32} />}
              value="25+"
              label="Years Experience"
            />
            <StatCard 
              icon={<Clock size={32} />}
              value="6k+"
              label="Service Hours"
            />
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-barber">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium">What We Stand For</h5>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values & Mission</h2>
            <div className="h-1 w-24 bg-barber-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <ValueCard 
              title="Excellence"
              description="We are committed to delivering exceptional service and results that exceed expectations in every aspect of our work."
            />
            <ValueCard 
              title="Integrity"
              description="We operate with honesty, transparency, and a genuine desire to provide the best experience for our clients."
            />
            <ValueCard 
              title="Craftsmanship"
              description="We approach each haircut as a work of art, combining technical skill with creative vision to achieve perfect results."
            />
            <ValueCard 
              title="Respect"
              description="We treat every client with the utmost respect, valuing their time, preferences, and individual style."
            />
            <ValueCard 
              title="Community"
              description="We are proud to be a gathering place where relationships are built and community connections are strengthened."
            />
            <ValueCard 
              title="Growth"
              description="We continuously seek to improve our skills, knowledge, and services to provide the best possible experience."
            />
          </div>

          <div className="bg-barber-light p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 text-center">Our Mission</h3>
            <p className="text-barber-gray text-center max-w-4xl mx-auto">
              At Elite Barber, our mission is to provide exceptional grooming services that enhance our clients' appearance and confidence in a welcoming, professional environment. We are dedicated to preserving the art of traditional barbering while embracing innovation, ensuring every client leaves looking and feeling their absolute best.
            </p>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-16 bg-barber-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium">The Professionals</h5>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Barbers</h2>
            <div className="h-1 w-24 bg-barber-gold mx-auto"></div>
            <p className="mt-6 text-barber-gray max-w-2xl mx-auto">
              Our team consists of skilled professionals with years of experience and training. 
              Each barber brings their unique expertise and passion to deliver exceptional results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BarberCard 
              name="James Elliott" 
              role="Founder & Master Barber"
              experience="25+ years experience"
              specialty="Classic cuts & hot shaves"
              imageUrl="/barber-1.jpg"
            />
            <BarberCard 
              name="Michael Torres" 
              role="Senior Barber"
              experience="15 years experience"
              specialty="Fades & beard styling"
              imageUrl="/barber-2.jpg"
            />
            <BarberCard 
              name="David Chen" 
              role="Style Specialist"
              experience="8 years experience"
              specialty="Modern styles & color"
              imageUrl="/barber-3.jpg"
            />
            <BarberCard 
              name="Robert Jackson" 
              role="Barber"
              experience="6 years experience"
              specialty="Precision cuts & lineups"
              imageUrl="/barber-4.jpg"
            />
          </div>
        </div>
      </section>
    </>
  );
};

const StatCard = ({ 
  icon, 
  value, 
  label 
}: { 
  icon: React.ReactNode; 
  value: string; 
  label: string;
}) => {
  return (
    <div className="text-center p-6">
      <div className="text-barber-gold mb-4">{icon}</div>
      <h3 className="text-3xl md:text-4xl font-bold mb-2">{value}</h3>
      <p className="text-barber-gray uppercase tracking-wider text-sm">{label}</p>
    </div>
  );
};

const ValueCard = ({ 
  title, 
  description 
}: { 
  title: string; 
  description: string;
}) => {
  return (
    <div className="bg-barber-light p-6 rounded-md transition-transform duration-300 hover:-translate-y-2">
      <div className="flex items-center mb-4">
        <div className="mr-4 text-barber-gold">
          <Star size={24} />
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-barber-gray">{description}</p>
    </div>
  );
};

const BarberCard = ({ 
  name, 
  role, 
  experience,
  specialty,
  imageUrl 
}: { 
  name: string; 
  role: string; 
  experience: string;
  specialty: string;
  imageUrl: string;
}) => {
  return (
    <div className="bg-barber-light rounded-md overflow-hidden">
      <div className="h-64">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-1">{name}</h3>
        <p className="text-barber-gold mb-4">{role}</p>
        <ul className="space-y-2">
          <li className="flex items-start text-sm">
            <Check size={16} className="mr-2 text-barber-gold shrink-0 mt-0.5" />
            <span className="text-barber-gray">{experience}</span>
          </li>
          <li className="flex items-start text-sm">
            <Check size={16} className="mr-2 text-barber-gold shrink-0 mt-0.5" />
            <span className="text-barber-gray">{specialty}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AboutPage;
