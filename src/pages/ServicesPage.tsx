
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Service data
const services = [
  {
    id: 1,
    category: "Haircuts",
    items: [
      {
        name: "Classic Haircut",
        price: 35,
        description: "Traditional haircut with clipper and scissors, includes styling and hot towel.",
        duration: "45 min",
        features: ["Consultation", "Shampoo", "Hot towel", "Styling"]
      },
      {
        name: "Skin Fade",
        price: 40,
        description: "Precision fade from skin to desired length on top with detailed blending.",
        duration: "45 min",
        features: ["Consultation", "Shampoo", "Hot towel", "Styling"]
      },
      {
        name: "Senior Haircut (65+)",
        price: 25,
        description: "Tailored haircut service for our senior clientele.",
        duration: "30 min",
        features: ["Consultation", "Styling", "Hot towel"]
      },
      {
        name: "Kids Haircut (Under 12)",
        price: 25,
        description: "Age-appropriate haircut for young gentlemen.",
        duration: "30 min",
        features: ["Kid-friendly approach", "Styling"]
      }
    ]
  },
  {
    id: 2,
    category: "Shaving & Beard Care",
    items: [
      {
        name: "Traditional Hot Shave",
        price: 40,
        description: "Luxurious straight razor shave with hot towels and premium products.",
        duration: "45 min",
        features: ["Hot towel treatment", "Pre-shave oil", "Straight razor", "Aftershave balm"]
      },
      {
        name: "Beard Trim",
        price: 25,
        description: "Shaping and maintenance for any beard style.",
        duration: "30 min",
        features: ["Consultation", "Precise trimming", "Beard oil treatment"]
      },
      {
        name: "Beard Design",
        price: 35,
        description: "Full beard styling including cheek and neck lines with razor detailing.",
        duration: "45 min",
        features: ["Consultation", "Precise trimming", "Line up", "Beard oil treatment"]
      }
    ]
  },
  {
    id: 3,
    category: "Combo Services",
    items: [
      {
        name: "Haircut & Beard Trim",
        price: 55,
        description: "Our most popular combination for complete grooming.",
        duration: "75 min",
        features: ["Full haircut service", "Beard shaping", "Hot towel", "Styling"]
      },
      {
        name: "Full Service",
        price: 75,
        description: "The complete experience including haircut, hot shave, and facial.",
        duration: "90 min",
        features: ["Haircut", "Hot shave", "Mini facial", "Scalp massage"]
      },
      {
        name: "Father & Son",
        price: 55,
        description: "Special package for father and son (under 12) haircuts.",
        duration: "75 min",
        features: ["Two haircuts", "Styling", "Bonding experience"]
      }
    ]
  },
  {
    id: 4,
    category: "Additional Services",
    items: [
      {
        name: "Hair Color",
        price: 45,
        description: "Professional color application to cover gray or change your look.",
        duration: "60 min",
        features: ["Consultation", "Premium color products", "Styling"]
      },
      {
        name: "Scalp Treatment",
        price: 30,
        description: "Therapeutic treatment for dry scalp with massage.",
        duration: "30 min",
        features: ["Deep cleansing", "Scalp massage", "Conditioning"]
      },
      {
        name: "Facial",
        price: 35,
        description: "Refreshing facial designed specifically for men's skin needs.",
        duration: "30 min",
        features: ["Cleansing", "Exfoliation", "Mask", "Moisturizer"]
      }
    ]
  }
];

const ServicesPage = () => {
  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-barber-dark">
        <div className="container mx-auto px-4 text-center">
          <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium">What We Offer</h5>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-barber-gray max-w-3xl mx-auto">
            At Elite Barber, we provide a range of premium grooming services tailored to meet your needs. 
            Each service is performed with precision and care by our skilled barbers.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 bg-barber">
        <div className="container mx-auto px-4">
          {services.map((category) => (
            <div key={category.id} className="mb-16 last:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 gold-border-bottom pb-3 inline-block">
                {category.category}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.items.map((service, index) => (
                  <ServiceCard 
                    key={index}
                    name={service.name}
                    price={service.price}
                    description={service.description}
                    duration={service.duration}
                    features={service.features}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-barber-gold">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">Ready to Look Your Best?</h2>
          <p className="text-barber-dark mb-8 max-w-2xl mx-auto">
            Book your appointment today and experience the Elite Barber difference. Our team of skilled professionals is ready to help you achieve your perfect look.
          </p>
          <Button asChild size="lg" className="bg-black hover:bg-black/90 text-white">
            <Link to="/booking">Book Your Appointment</Link>
          </Button>
        </div>
      </section>
    </>
  );
};

const ServiceCard = ({ 
  name, 
  price, 
  description,
  duration,
  features
}: { 
  name: string; 
  price: number; 
  description: string; 
  duration: string;
  features: string[];
}) => {
  return (
    <div className="bg-barber-light p-6 rounded-md h-full flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold">{name}</h3>
        <span className="text-barber-gold font-bold text-xl">${price}</span>
      </div>
      <p className="text-sm text-barber-gray mb-1">Duration: {duration}</p>
      <p className="text-barber-gray mb-4">{description}</p>
      <div className="mt-auto">
        <h4 className="font-medium mb-2">Includes:</h4>
        <ul className="space-y-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm">
              <Check size={16} className="mr-2 text-barber-gold shrink-0 mt-0.5" />
              <span className="text-barber-gray">{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <Button asChild className="w-full bg-barber-gold hover:bg-barber-gold/90 text-black">
            <Link to="/booking">Book Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
