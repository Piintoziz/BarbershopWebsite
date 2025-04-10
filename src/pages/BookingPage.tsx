
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, Clipboard, Scissors, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

// Service data for booking
const serviceOptions = [
  { id: 'haircut', name: 'Classic Haircut', price: 35, duration: '45 min' },
  { id: 'fade', name: 'Skin Fade', price: 40, duration: '45 min' },
  { id: 'hot-shave', name: 'Hot Shave', price: 40, duration: '45 min' },
  { id: 'beard-trim', name: 'Beard Trim', price: 25, duration: '30 min' },
  { id: 'haircut-beard', name: 'Haircut & Beard Trim', price: 55, duration: '75 min' },
  { id: 'full-service', name: 'Full Service', price: 75, duration: '90 min' },
];

// Available time slots
const generateTimeSlots = () => {
  const slots = [];
  // Open from 9 AM to 7 PM (last appointment)
  for (let hour = 9; hour <= 19; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 19 && minute > 0) continue; // Don't add slots after 7 PM
      const formattedHour = hour % 12 || 12;
      const period = hour >= 12 ? 'PM' : 'AM';
      const formattedMinute = minute === 0 ? '00' : minute;
      slots.push(`${formattedHour}:${formattedMinute} ${period}`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

const BookingPage = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [step, setStep] = useState(1);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step === 1 && !selectedService) {
      toast({
        title: "Service Required",
        description: "Please select a service to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 2 && (!selectedDate || !selectedTime)) {
      toast({
        title: "Date and Time Required",
        description: "Please select both a date and time for your appointment.",
        variant: "destructive",
      });
      return;
    }

    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // In a real application, you would send this data to a server
    const bookingData = {
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      ...formData
    };
    console.log('Booking submitted:', bookingData);
    
    toast({
      title: "Booking Successful!",
      description: "Your appointment has been scheduled. We'll see you soon!",
    });
    
    // Reset form
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setFormData({
      name: '',
      email: '',
      phone: ''
    });
    setStep(1);
  };

  const selectedServiceDetails = selectedService ? serviceOptions.find(s => s.id === selectedService) : null;

  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-barber-dark">
        <div className="container mx-auto px-4 text-center">
          <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium">Book Your Visit</h5>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Online Booking</h1>
          <p className="text-barber-gray max-w-3xl mx-auto">
            Schedule your next appointment in just a few simple steps. 
            Choose your preferred service, date, time, and provide your contact information.
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-16 bg-barber">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-barber-light p-8 rounded-lg">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex justify-between">
                <StepIndicator 
                  number={1} 
                  title="Select Service" 
                  active={step === 1} 
                  completed={step > 1}
                />
                <div className="hidden sm:block w-full border-t-2 border-barber self-center mx-2"></div>
                <StepIndicator 
                  number={2} 
                  title="Choose Date & Time" 
                  active={step === 2} 
                  completed={step > 2}
                />
                <div className="hidden sm:block w-full border-t-2 border-barber self-center mx-2"></div>
                <StepIndicator 
                  number={3} 
                  title="Your Details" 
                  active={step === 3} 
                  completed={false}
                />
              </div>
            </div>

            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Select a Service</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {serviceOptions.map((service) => (
                    <button
                      key={service.id}
                      className={`p-4 rounded-md border-2 text-left transition-all ${
                        selectedService === service.id 
                          ? 'border-barber-gold bg-barber-dark' 
                          : 'border-barber hover:border-barber-gold'
                      }`}
                      onClick={() => handleServiceSelect(service.id)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{service.name}</h3>
                        {selectedService === service.id && (
                          <Check className="text-barber-gold h-5 w-5" />
                        )}
                      </div>
                      <div className="flex justify-between text-barber-gray text-sm">
                        <span>${service.price}</span>
                        <span>{service.duration}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={nextStep} 
                    className="bg-barber-gold hover:bg-barber-gold/90 text-black"
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Date and Time Selection */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Choose Date & Time</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal ${
                            !selectedDate ? "text-muted-foreground" : ""
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-barber-dark" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => {
                            // Disable dates in the past
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Time</label>
                    <div className="h-64 overflow-y-auto border border-barber rounded-md p-2">
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            className={`p-2 rounded-md text-center transition-colors ${
                              selectedTime === time 
                                ? 'bg-barber-gold text-black' 
                                : 'bg-barber hover:bg-barber-light'
                            }`}
                            onClick={() => handleTimeSelect(time)}
                          >
                            <span className="flex items-center justify-center">
                              <Clock className="mr-1 h-4 w-4" />
                              {time}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    onClick={prevStep} 
                    variant="outline" 
                    className="border-barber-gray text-barber-gray hover:bg-barber"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={nextStep} 
                    className="bg-barber-gold hover:bg-barber-gold/90 text-black"
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Personal Details */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Your Details</h2>
                
                {/* Booking Summary */}
                <div className="mb-6 bg-barber p-4 rounded-md">
                  <h3 className="font-medium mb-3">Booking Summary</h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <Scissors className="mr-3 h-5 w-5 text-barber-gold flex-shrink-0" />
                      <div>
                        <p>Service:</p>
                        <p className="text-barber-gold">{selectedServiceDetails?.name} (${selectedServiceDetails?.price})</p>
                      </div>
                    </div>
                    <div className="flex">
                      <CalendarIcon className="mr-3 h-5 w-5 text-barber-gold flex-shrink-0" />
                      <div>
                        <p>Date:</p>
                        <p className="text-barber-gold">{selectedDate ? format(selectedDate, "MMMM d, yyyy") : ''}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <Clock className="mr-3 h-5 w-5 text-barber-gold flex-shrink-0" />
                      <div>
                        <p>Time:</p>
                        <p className="text-barber-gold">{selectedTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contact Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      <span className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Your Name
                      </span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="bg-barber border-barber focus:border-barber-gold"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      <span className="flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        Email Address
                      </span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="bg-barber border-barber focus:border-barber-gold"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      <span className="flex items-center">
                        <Phone className="mr-2 h-4 w-4" />
                        Phone Number
                      </span>
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(123) 456-7890"
                      required
                      className="bg-barber border-barber focus:border-barber-gold"
                    />
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button 
                      onClick={prevStep} 
                      type="button"
                      variant="outline" 
                      className="border-barber-gray text-barber-gray hover:bg-barber"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-barber-gold hover:bg-barber-gold/90 text-black"
                    >
                      Complete Booking
                      <Clipboard className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

const StepIndicator = ({ 
  number, 
  title, 
  active, 
  completed
}: { 
  number: number; 
  title: string; 
  active: boolean; 
  completed: boolean;
}) => {
  return (
    <div className="flex flex-col items-center relative z-10">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
        active ? 'bg-barber-gold text-black' : 
        completed ? 'bg-green-500 text-white' : 
        'bg-barber text-barber-gray'
      } mb-2`}>
        {completed ? <Check className="h-6 w-6" /> : number}
      </div>
      <span className={`text-sm hidden sm:block ${active ? 'text-barber-gold' : 'text-barber-gray'}`}>
        {title}
      </span>
    </div>
  );
};

export default BookingPage;
