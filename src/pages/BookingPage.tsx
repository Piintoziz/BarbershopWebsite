import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
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
import { cn } from '@/lib/utils';
import { 
  getBarbers, 
  getServices, 
  getAvailableSlots, 
  createAppointment,
  getCurrentUser,
  getBusinessHours,
  getClosedDays,
  getAvailableBarbersForService
} from '@/lib/supabase';

// Tipos
interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  isCombo?: boolean;
  includedServices?: string[];
}

interface Barber {
  id: string;
  name: string;
  email: string;
  specialty?: string;
  profile_image_url?: string;
}

interface TimeSlot {
  available_time: string;
  isTooLate?: boolean;
}

// Dados iniciais (serão substituídos pelos dados do Supabase)
const initialServiceOptions: Service[] = [
  {
    id: 'corte',
    name: 'Corte de Cabelo',
    price: 15.00,
    duration: 30,
  },
  {
    id: 'barba',
    name: 'Barba',
    price: 10.00,
    duration: 30,
  }
];

// Dados iniciais (serão substituídos pelos dados do Supabase)
const initialBarbers: Barber[] = [
  {
    id: 'barber1',
    name: 'João Silva',
    email: 'joao.silva@example.com',
    specialty: 'Especialista em Cortes Modernos',
  },
  {
    id: 'barber2',
    name: 'Manuel Oliveira',
    email: 'manuel.oliveira@example.com',
    specialty: 'Especialista em Barbas',
  }
];

// Função auxiliar para gerar slots de tempo
const generateTimeSlots = () => {
  const slots: string[] = [];
  // Start at 9 AM, end at 7 PM
  for (let hour = 9; hour < 19; hour++) {
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour >= 12 ? 'PM' : 'AM';
    slots.push(`${formattedHour}:00 ${period}`);
  }
  return slots;
};

const timeSlots = generateTimeSlots();

const BookingPage = () => {
  const [serviceOptions, setServiceOptions] = useState<Service[]>(initialServiceOptions);
  const [barbers, setBarbers] = useState<Barber[]>(initialBarbers);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [step, setStep] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [closedWeekdays, setClosedWeekdays] = useState<number[]>([]);
  const [closedDates, setClosedDates] = useState<string[]>([]);
  const [availableBarberIds, setAvailableBarberIds] = useState<string[] | null>(null);
  const [loadingBarbers, setLoadingBarbers] = useState(false);
  const navigate = useNavigate();

  // Buscar dados do Supabase ao carregar a página
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar autenticação
        const { data: { user } } = await getCurrentUser();
        setIsAuthenticated(!!user);
        
        if (user) {
          // Preencher dados do usuário se estiver autenticado
          const email = user.email || '';
          const name = `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim();
          const phone = user.user_metadata?.phone || '';
          
          setFormData({
            name: name || '',
            email: email || '',
            phone: phone || ''
          });
        }
        
        // Buscar serviços
        const { data: servicesData, error: servicesError } = await getServices();
        if (servicesError) throw servicesError;
        if (servicesData) {
          const formattedServices = servicesData.map(service => ({
            id: service.id,
            name: service.name,
            price: service.price,
            duration: service.duration,
            description: service.description,
            isCombo: service.is_combo,
            includedServices: service.included_services
          }));
          setServiceOptions(formattedServices);
        }
        
        // Buscar barbeiros
        const { data: barbersData, error: barbersError } = await getBarbers();
        if (barbersError) throw barbersError;
        if (barbersData) {
          setBarbers(barbersData);
        }
        
        // Verificar se há um agendamento pendente no sessionStorage
        const pendingBooking = sessionStorage.getItem('pendingBooking');
        if (pendingBooking) {
          const booking = JSON.parse(pendingBooking);
          setSelectedService(booking.service || null);
          setSelectedBarber(booking.barber || null);
          setSelectedDate(booking.date ? new Date(booking.date) : undefined);
          setSelectedTime(booking.time || null);
          
          // Definir o passo adequado
          if (booking.service && booking.barber && booking.date && booking.time) {
            setStep(4);
          } else if (booking.service && booking.barber && booking.date) {
            setStep(3);
          } else if (booking.service && booking.barber) {
            setStep(2);
          } else if (booking.service) {
            setStep(1);
          }
          
          // Limpar o agendamento pendente
          sessionStorage.removeItem('pendingBooking');
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro ao Carregar Dados",
          description: "Ocorreu um erro ao carregar as informações. Por favor, tente novamente.",
          variant: "destructive",
        });
      }
    };
    
    fetchData();
  }, []);

  // Atualizar para também buscar os horários disponíveis quando o usuário selecionar uma data
  useEffect(() => {
    if (selectedBarber && selectedService && selectedDate) {
      fetchAvailableTimeSlots();
    }
  }, [selectedBarber, selectedService, selectedDate]);

  const fetchAvailableTimeSlots = async () => {
    if (!selectedBarber || !selectedService || !selectedDate) return;
    
    try {
      setIsLoading(true);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      console.log("Chamando getAvailableSlots com:", { barberId: selectedBarber, date: formattedDate, serviceId: selectedService });
      
      const { data, error } = await getAvailableSlots(selectedBarber, formattedDate, selectedService);
      console.log("Resposta de getAvailableSlots:", { data, error });
      
      if (error) {
        console.error("Erro completo ao buscar horários:", error);
        throw error; 
      }
      
      if (data && data.length > 0) {
        const now = new Date();
        // Calculate cutoff time (now + 5 minutes)
        const cutoffTime = new Date(now.getTime() + 5 * 60 * 1000);
        
        const processedSlots = data.map((slot: { available_time: string }) => {
          // Create a Date object for the slot time on the selected date
          const [hours, minutes] = slot.available_time.split(':');
          const slotDateTime = new Date(selectedDate);
          slotDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
          
          // Check if the slot time is past or within the next 5 minutes
          const isTooLate = slotDateTime < cutoffTime;
          
          return { 
            available_time: slot.available_time, 
            isTooLate: isTooLate 
          };
        });
        
        // Update state with processed slots including the isTooLate flag
        setAvailableTimeSlots(processedSlots);
        setSelectedTime(null); 
      } else {
        setAvailableTimeSlots([]);
        toast({
          title: "Sem Horários Disponíveis",
          description: "Não há horários disponíveis para este barbeiro nesta data. Por favor, escolha outra data ou outro barbeiro.",
          variant: "default", // Changed to default as it's informational
        });
      }
    } catch (error: any) {
      console.error("Erro detalhado no catch:", error);
      toast({
        title: "Erro ao Buscar Horários",
        description: error?.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
       setAvailableTimeSlots([]); // Clear slots on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleBarberSelect = (barberId: string) => {
    setSelectedBarber(barberId);
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
        title: "Serviço Obrigatório",
        description: "Por favor, selecione um serviço para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (step === 2 && !selectedBarber) {
      toast({
        title: "Barbeiro Obrigatório",
        description: "Por favor, selecione um barbeiro para continuar.",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 3 && (!selectedDate || !selectedTime)) {
      toast({
        title: "Data e Hora Obrigatórias",
        description: "Por favor, selecione uma data e hora para a sua consulta.",
        variant: "destructive",
      });
      return;
    }
    
    // If not authenticated and moving to final step, redirect to login
    if (!isAuthenticated && step === 3) {
      toast({
        title: "Login Necessário",
        description: "Por favor, inicie sessão ou crie uma conta para completar a sua reserva.",
      });
      
      // Store booking data in session storage temporarily
      sessionStorage.setItem('pendingBooking', JSON.stringify({
        service: selectedService,
        barber: selectedBarber,
        date: selectedDate,
        time: selectedTime
      }));
      
      navigate('/login');
      return;
    }

    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    // Validação simples dos campos
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Dados Incompletos",
        description: "Por favor, preencha todos os campos do formulário.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Obter horário de término baseado na duração
      const selectedServiceDetails = serviceOptions.find(s => s.id === selectedService);
      if (!selectedService || !selectedDate || !selectedTime || !selectedBarber) {
        throw new Error("Dados de agendamento incompletos. Por favor, selecione serviço, data e hora.");
      }
      
      const serviceDuration = selectedServiceDetails?.duration || 30; // Default 30 min
      
      // Data formatada para a API
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Calcular horário de término
      const startTime = selectedTime;
      
      // Converter para minutos, adicionar duração e converter de volta para hora:minuto
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = startMinutes + serviceDuration;
      const endHour = Math.floor(endMinutes / 60);
      const endMinute = endMinutes % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      // Dados de agendamento
      const appointmentData = {
        barber_id: selectedBarber,
        client_name: formData.name,
        client_email: formData.email,
        client_phone: formData.phone,
        service_id: selectedService,
        appointment_date: formattedDate,
        start_time: startTime,
        end_time: endTime,
        notes: ''
      };
      
      const { data, error } = await createAppointment(appointmentData);
      
      if (error) throw error;
      
      toast({
        title: "Reserva Efetuada com Sucesso!",
        description: "A sua consulta foi agendada. Um email de confirmação foi enviado para o seu endereço de email.",
      });
      
      // Processar apenas o email mais recente
      console.log("Processando email de confirmação");
      try {
        const { processEmailQueue } = await import('@/lib/supabase');
        const result = await processEmailQueue(1); // Processa apenas 1 email
        console.log("Resultado do processamento do email:", result);
      } catch (emailError) {
        console.error("Erro ao processar email:", emailError);
      }
      
      // Resetar formulário
      setSelectedService(null);
      setSelectedBarber(null);
      setSelectedDate(undefined);
      setSelectedTime(null);
      setFormData({
        name: '',
        email: '',
        phone: ''
      });
      setStep(1);
      
      // Redirecionar para a página inicial após o agendamento bem-sucedido
      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      console.error("Erro ao criar marcação:", error);
      toast({
        title: "Erro ao Criar Marcação",
        description: error.message || "Não foi possível criar a sua marcação. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedServiceDetails = selectedService ? serviceOptions.find(s => s.id === selectedService) : null;

  // Buscar horários de funcionamento E DIAS FECHADOS ao montar
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Buscar Business Hours (para dias da semana fechados)
        const { data: hoursData, error: hoursError } = await getBusinessHours();
        if (hoursError) throw hoursError;
        if (hoursData) {
          const closedDaysMap: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
          const closedWDays = hoursData.filter(day => !day.is_open).map(day => closedDaysMap[day.day_of_week]);
          setClosedWeekdays(closedWDays);
        }
        
        // Buscar Closed Days (para datas específicas fechadas)
        const { data: closedDaysData, error: closedDaysError } = await getClosedDays(); // Chamar a função getClosedDays
        if (closedDaysError) throw closedDaysError;
        if (closedDaysData) {
          const dates = closedDaysData.map(day => day.date); // Assume que a data já está no formato YYYY-MM-DD
          setClosedDates(dates);
        }
        
      } catch (error) {
        console.error("Erro ao buscar dados iniciais (horários/feriados):", error);
        toast({ title: "Erro", description: "Não foi possível carregar as configurações de horário.", variant: "destructive" });
      }
    };
    
    fetchInitialData();
  }, []);

  // Buscar barbeiros disponíveis QUANDO o serviço mudar
  useEffect(() => {
    const fetchBarbersForService = async () => {
      if (!selectedService) {
        setAvailableBarberIds(barbers.map(b => b.id)); // Se nenhum serviço, todos estão disponíveis
        setLoadingBarbers(false);
        return;
      }
      
      setLoadingBarbers(true);
      try {
        const { data, error } = await getAvailableBarbersForService(selectedService);
        
        if (error) throw error;
        
        const availableIds = data ? data.map(item => item.barber_id) : [];
        setAvailableBarberIds(availableIds);
        
        // Resetar barbeiro selecionado se ele não estiver disponível para o novo serviço
        if (selectedBarber && !availableIds.includes(selectedBarber)) {
          setSelectedBarber(null); 
          setSelectedTime(null); // Resetar hora também
          setAvailableTimeSlots([]); // Limpar slots
          toast({ 
            title: "Barbeiro Indisponível", 
            description: "O barbeiro selecionado anteriormente não realiza este serviço.",
            variant: "default" // Usar variante info ou default
          });
        }
        
      } catch (error) {
        console.error("Erro ao buscar barbeiros para o serviço:", error);
        toast({ title: "Erro", description: "Não foi possível carregar os barbeiros disponíveis.", variant: "destructive" });
        setAvailableBarberIds([]); // Em caso de erro, mostrar nenhum barbeiro
      } finally {
        setLoadingBarbers(false);
      }
    };

    fetchBarbersForService();
  }, [selectedService, barbers]); // Depender de selectedService E da lista completa de barbers
  
  // Filtrar barbeiros para exibição
  const filteredBarbers = availableBarberIds === null
    ? [] // Não mostrar ninguém enquanto carrega ou se estado inicial for null
    : barbers.filter(barber => availableBarberIds.includes(barber.id));

  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-[#0a0a0a]">
        <div className="container mx-auto px-4 text-center">
          <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium">Marque a Sua Visita</h5>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Reserva Online</h1>
          <p className="text-barber-gray max-w-3xl mx-auto">
            Agende a sua próxima consulta em apenas alguns passos simples. 
            Escolha o serviço preferido, data, hora e forneça os seus dados de contacto.
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-16 bg-[#111111]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto glass-card p-8 rounded-lg">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex justify-between">
                <StepIndicator 
                  number={1} 
                  title="Selecionar Serviço" 
                  active={step === 1} 
                  completed={step > 1}
                />
                <div className="hidden sm:block w-full border-t-2 border-[#333] self-center mx-2"></div>
                <StepIndicator 
                  number={2} 
                  title="Escolher Barbeiro" 
                  active={step === 2} 
                  completed={step > 2}
                />
                <div className="hidden sm:block w-full border-t-2 border-[#333] self-center mx-2"></div>
                <StepIndicator 
                  number={3} 
                  title="Escolher Data & Hora" 
                  active={step === 3} 
                  completed={step > 3}
                />
                <div className="hidden sm:block w-full border-t-2 border-[#333] self-center mx-2"></div>
                <StepIndicator 
                  number={4} 
                  title="Seus Dados" 
                  active={step === 4} 
                  completed={false}
                />
              </div>
            </div>

            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Selecione um Serviço</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {serviceOptions.map((service) => (
                    <button
                      key={service.id}
                      className={`p-4 rounded-md border-2 text-left transition-all hover-scale ${
                        selectedService === service.id 
                          ? 'border-barber-gold bg-[#1c1c1c]' 
                          : 'border-[#333] hover:border-barber-gold'
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
                        <span>{service.price} €</span>
                        <span>{service.duration} min</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={nextStep} 
                    className="bg-barber-gold hover:bg-barber-gold/90 text-black"
                  >
                    Próximo Passo
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Barber Selection */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Selecione o Barbeiro</h2>
                {loadingBarbers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-barber-gold mx-auto"></div>
                    <p className="mt-4 text-barber-gray">A verificar disponibilidade dos barbeiros...</p>
                  </div>
                ) : filteredBarbers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredBarbers.map(barber => (
                      <button
                        key={barber.id}
                        onClick={() => handleBarberSelect(barber.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all flex items-center space-x-4 ${
                          selectedBarber === barber.id
                            ? 'border-barber-gold bg-[#1c1c1c]'
                            : 'border-[#333] hover:border-barber-gold'
                        }`}
                      >
                        <img 
                          src={barber.profile_image_url || 'https://via.placeholder.com/60/222222/eeeeee?text=B'} 
                          alt={barber.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#333]"
                        />
                        <div>
                           <span className="block font-medium">{barber.name}</span>
                           {/* Adicionar especialidade ou outra info se disponível */}
                           {/* <span className="text-sm text-barber-gray">{barber.specialty || 'Especialista'}</span> */}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                   <div className="text-center py-8 border border-[#333] rounded-lg">
                     <User className="h-12 w-12 text-barber-gray mx-auto mb-3" />
                     <h3 className="text-xl font-bold mb-2">Nenhum Barbeiro Disponível</h3>
                     <p className="text-barber-gray">
                       Não há barbeiros disponíveis que realizem o serviço selecionado.
                     </p>
                     <p className="text-barber-gold mt-2">Por favor, escolha outro serviço.</p>
                   </div>
                )}
                
                {/* Botões Voltar/Próximo */}
                <div className="mt-8 flex justify-between">
                  <Button 
                    onClick={prevStep}
                    variant="outline"
                    className="border-[#333] text-barber-gray hover:bg-[#1c1c1c]"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={nextStep} 
                    className="bg-barber-gold hover:bg-barber-gold/90 text-black"
                    disabled={!selectedBarber || loadingBarbers}
                  >
                    Próximo Passo
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Date and Time Selection */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Escolha Data & Hora</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Selecione a Data</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal ${
                            !selectedDate ? "text-muted-foreground" : ""
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Selecione uma data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) setSelectedDate(date);
                          }}
                          disabled={(date) => {
                            const formattedDate = format(date, 'yyyy-MM-dd');
                            return (
                              date < new Date(new Date().setHours(0, 0, 0, 0)) || // Dias passados
                              closedWeekdays.includes(date.getDay()) || // Dias da semana fechados
                              closedDates.includes(formattedDate) // Datas específicas fechadas (feriados)
                            );
                          }}
                          initialFocus
                          locale={pt}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Selecione o Horário</label>
                    <div className="grid grid-cols-3 gap-2">
                      {isLoading ? (
                        <div className="col-span-3 text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-barber-gold mx-auto"></div>
                          <p className="mt-2 text-barber-gray">Carregando horários disponíveis...</p>
                        </div>
                      ) : availableTimeSlots.filter(slot => !slot.isTooLate).length > 0 ? (
                        availableTimeSlots
                          .filter(slot => !slot.isTooLate)
                          .map((slot, index) => (
                            <button
                              key={index}
                              className={cn(
                                "p-2 text-sm rounded-md border-2 transition-all",
                                selectedTime === slot.available_time
                                  ? 'border-barber-gold bg-[#1c1c1c]'
                                  : 'border-[#333] hover:border-barber-gold'
                              )}
                              onClick={() => handleTimeSelect(slot.available_time)}
                            >
                              {slot.available_time}
                            </button>
                          ))
                      ) : selectedDate ? (
                        <div className="col-span-3 text-center py-4">
                          <p className="text-barber-gray">Nenhum horário disponível para esta data (ou já passou).</p>
                          <p className="text-barber-gold mt-2">Por favor, selecione outra data ou outro barbeiro.</p>
                        </div>
                      ) : (
                        <div className="col-span-3 text-center py-4">
                          <p className="text-barber-gray">Selecione uma data para ver os horários disponíveis.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    onClick={prevStep}
                    variant="outline"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={nextStep} 
                    className="bg-barber-gold hover:bg-barber-gold/90 text-black"
                    disabled={!selectedDate || !selectedTime}
                  >
                    Próximo Passo
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Personal Details */}
            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Seus Dados</h2>
                
                {/* Booking Summary */}
                <div className="mb-6 bg-[#1c1c1c] p-4 rounded-md">
                  <h3 className="font-medium mb-3">Resumo da Reserva</h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <Scissors className="mr-3 h-5 w-5 text-barber-gold flex-shrink-0" />
                      <div>
                        <p>Serviço:</p>
                        <p className="text-barber-gold">{selectedServiceDetails?.name} ({selectedServiceDetails?.price} €)</p>
                      </div>
                    </div>
                    <div className="flex">
                      <User className="mr-3 h-5 w-5 text-barber-gold flex-shrink-0" />
                      <div>
                        <p>Barbeiro:</p>
                        <p className="text-barber-gold">{barbers.find(b => b.id === selectedBarber)?.name}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <CalendarIcon className="mr-3 h-5 w-5 text-barber-gold flex-shrink-0" />
                      <div>
                        <p>Data:</p>
                        <p className="text-barber-gold">{selectedDate ? format(selectedDate, "d 'de' MMMM 'de' yyyy") : ''}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <Clock className="mr-3 h-5 w-5 text-barber-gold flex-shrink-0" />
                      <div>
                        <p>Hora:</p>
                        <p className="text-barber-gold">{selectedTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contact Form */}
                <form onSubmit={handleSubmit}>
                  <div className="form-control-wrapper">
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      <span className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Nome Completo
                      </span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="João Silva"
                      required
                      className="bg-[#1c1c1c] border-[#333] focus:border-barber-gold"
                    />
                  </div>
                  <div className="form-control-wrapper">
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      <span className="flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="joao@exemplo.com"
                      required
                      className="bg-[#1c1c1c] border-[#333] focus:border-barber-gold"
                    />
                  </div>
                  <div className="form-control-wrapper">
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      <span className="flex items-center">
                        <Phone className="mr-2 h-4 w-4" />
                        Telefone
                      </span>
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="912 345 678"
                      required
                      className="bg-[#1c1c1c] border-[#333] focus:border-barber-gold"
                    />
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button 
                      onClick={prevStep} 
                      type="button"
                      variant="outline" 
                      className="border-[#333] text-barber-gray hover:bg-[#1c1c1c]"
                    >
                      Voltar
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-barber-gold hover:bg-barber-gold/90 text-black"
                    >
                      Concluir Reserva
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
        'bg-[#1c1c1c] text-barber-gray'
      } mb-2`}>
        {completed ? <Check className="h-6 w-6" /> : number}
      </div>
      <span className={`text-xs hidden sm:block ${active ? 'text-barber-gold' : 'text-barber-gray'}`}>
        {title}
      </span>
    </div>
  );
};

export default BookingPage;
