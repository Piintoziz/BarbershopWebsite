import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, startOfWeek, endOfWeek, addDays, subDays, eachDayOfInterval, isSameDay, parse } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Scissors, 
  User, 
  Phone, 
  Clock, 
  LogOut, 
  Search, 
  Check, 
  X,
  BarChart,
  Settings,
  CalendarDays,
  PlusCircle,
  Database,
  Users, // Keep this one
  FileText, // Keep existing icons
  UsersRound, // Icon for Horarios section
  CircleUserRound, // Import icon for Barbers section
  UserCog, // Added new icon
  Trash2, // Added new icon
  Loader2, // Added new icon
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { 
  getBarbers, 
  getBarberAppointments, 
  getBarberIdForCurrentUser, 
  supabase,
  updateAppointmentStatus as supabaseUpdateStatus,
  getServices,
  createService,
  updateService,
  deleteService,
  getServiceBarberAvailability,
  updateServiceBarberAvailability,
  refreshSchemaCache,
  getBusinessHours,
  updateBusinessHours,
  getClosedDays,    // Importar
  addClosedDay,     // Importar
  removeClosedDay,   // Importar
  getMessageTemplates, // Importar
  upsertMessageTemplate, // Importar
  createBarber,
  updateBarber,
  deleteBarber,
  uploadBarberProfileImage,
  // Novas importações para horários dos barbeiros
  getBarberWorkingHours,
  updateBarberWorkingHour,
  deleteBarberWorkingHour,
  setupDefaultWorkingHours,
  BarberWorkingHour, // <--- Adicionar esta interface
  getDashboardData, DashboardData
} from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format as formatDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter // Ensure CardFooter is imported if needed elsewhere
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Add Table imports
import React from 'react';

interface Appointment {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  barber_id: string;
  service_id: string; // Manter apenas o ID do serviço
  profile_image_url?: string;
}

interface Barber {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profile_image_url?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  isCombo: boolean;
  includedServices?: string[];
}

// Interface for Report Data Structure
interface ReportData {
  totalRevenue: number;
  revenuePerBarber: Record<string, { name: string; revenue: number }>;
  revenuePerService: Record<string, { name: string; revenue: number; count: number }>;
  cancelledCount: number;
  startDate: string;
  endDate: string;
}

// Interface for Client Stats
interface ClientStats {
  totalActiveClients: number;
  topClients: { name: string; phone?: string; email?: string; visits: number }[];
  // We might add a full client list here later
  // allClients: { name: string; phone?: string; email?: string; }[];
}

const AdminDashboardPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBarber, setSelectedBarber] = useState<string | 'all'>('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'barber' | null>(null);
  const [currentBarber, setCurrentBarber] = useState<string | null>(null);
  const [updatingAppointment, setUpdatingAppointment] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'appointments' | 'services' | 'settings' | 'horarios' | 'reports' | 'clients' | 'barbers'>('appointments'); // Ensure reports is included
  
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false); // New state for loading dashboard data
  
  const [services, setServices] = useState<Service[]>([
    { id: '1', name: 'Corte de Cabelo', description: 'Corte masculino com tesoura e máquina', price: 25, duration: 30, isCombo: false },
    { id: '2', name: 'Barba', description: 'Aparar e modelar a barba', price: 15, duration: 20, isCombo: false },
    { id: '3', name: 'Corte + Barba', description: 'Pacote completo de corte e barba', price: 35, duration: 50, isCombo: true, includedServices: ['1', '2'] },
    { id: '4', name: 'Tratamento Capilar', description: 'Tratamento para queda de cabelo', price: 40, duration: 45, isCombo: false },
    { id: '5', name: 'Coloração', description: 'Pintura de cabelo e barba', price: 50, duration: 60, isCombo: false },
  ]);
  
  const [serviceBarberAvailability, setServiceBarberAvailability] = useState<Record<string, string[]>>({
    '1': ['1', '2', '3'], // Serviço 1 disponível para os barbeiros 1, 2 e 3
    '2': ['1', '2', '3', '4'],
    '3': ['1', '2'],
    '4': ['3', '4'],
    '5': ['2', '3'],
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [newService, setNewService] = useState<Service>({
    id: '',
    name: '',
    description: '',
    price: 0,
    duration: 30,
    isCombo: false,
    includedServices: [],
  });
  
  const navigate = useNavigate();

  // Estados para as configurações da barbearia
  const [workingHours, setWorkingHours] = useState({
    monday: { open: '09:00', close: '19:00', isOpen: true },
    tuesday: { open: '09:00', close: '19:00', isOpen: true },
    wednesday: { open: '09:00', close: '19:00', isOpen: true },
    thursday: { open: '09:00', close: '19:00', isOpen: true },
    friday: { open: '09:00', close: '19:00', isOpen: true },
    saturday: { open: '09:00', close: '17:00', isOpen: true },
    sunday: { open: '09:00', close: '17:00', isOpen: false },
  });
  
  const [holidays, setHolidays] = useState<Date[]>([]);
  const [holidayName, setHolidayName] = useState('');
  const [holidaysList, setHolidaysList] = useState<{id?: string, date: string, description: string}[]>([]); // Atualizar tipo
  const [selectedHolidayDate, setSelectedHolidayDate] = useState<Date | null>(null);
  
  const [automatedMessages, setAutomatedMessages] = useState({
    bookingConfirmation: "Olá {{nome}}. Sua marcação na Studio53 está confirmada para {{data}} às {{hora}}. Serviço: {{servico}}. Qualquer alteração, entre em contato.",
    reminderMessage: "Olá {{nome}}. Lembramos que você tem uma marcação amanhã na Studio53, às {{hora}}. Esperamos por você!",
    cancellationMessage: "Olá {{nome}}. Sua marcação na Studio53 para {{data}} às {{hora}} foi cancelada. Para mais informações, entre em contato."
  });
  
  const [savingSettings, setSavingSettings] = useState(false);
  
  const [showDbSetupDialog, setShowDbSetupDialog] = useState(false);
  
  const [initialMessagesLoaded, setInitialMessagesLoaded] = useState(false); // Flag para carregar apenas uma vez
  
  // State for weekly schedule view
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Week starts on Monday
  
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  // Adjust SelectedEventDetails to better match Appointment structure
  interface SelectedEventDetails extends Appointment {
    start?: Date | null; // Make optional as we might just pass the strings
    end?: Date | null;
  }
  const [selectedEventDetails, setSelectedEventDetails] = useState<SelectedEventDetails | null>(null);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [statusUpdateInfo, setStatusUpdateInfo] = useState<{ id: string; status: Appointment['status'] } | null>(null);
  
  // States for Reporting
  const [reportStartDate, setReportStartDate] = useState<Date | undefined>(undefined);
  const [reportEndDate, setReportEndDate] = useState<Date | undefined>(undefined);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // States for Client Management
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [isLoadingClientStats, setIsLoadingClientStats] = useState(false);
  
  // Estado para o diálogo de barber
  const [isBarberDialogOpen, setIsBarberDialogOpen] = useState(false);
  const [newBarber, setNewBarber] = useState<Omit<Barber, 'id'>>({ name: '', email: '', phone: '', profile_image_url: '' });
  const [addingBarber, setAddingBarber] = useState(false); // Loading state for add barber
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [isEditBarberDialogOpen, setIsEditBarberDialogOpen] = useState(false);
  const [deletingBarber, setDeletingBarber] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  // Verificar autenticação e carregar o papel do usuário
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    const storedRole = localStorage.getItem('userRole') as 'admin' | 'barber' | null;
    
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }
    
    setUserRole(storedRole);
    
    // Se for barbeiro, buscar o ID do barbeiro atual
    if (storedRole === 'barber') {
      fetchCurrentBarberId();
    }
    
    // Carregar barbeiros e marcações
    fetchBarbers();
  }, [navigate]);

  // Quando o barbeiro atual mudar ou a data mudar, buscar marcações
  useEffect(() => {
    if (userRole === 'barber' && currentBarber) {
      fetchAppointmentsForBarber(currentBarber);
      setSelectedBarber(currentBarber);
    } else if (userRole === 'admin') {
      fetchAllAppointments();
    }
  }, [userRole, currentBarber, selectedDate]);
  
  // Filtrar marcações quando os filtros mudarem
  useEffect(() => {
    filterAppointments();
  }, [appointments, selectedDate, selectedBarber, searchTerm]);

  // Buscar o ID do barbeiro atual
  const fetchCurrentBarberId = async () => {
    try {
      const barberId = await getBarberIdForCurrentUser();
      if (barberId) {
        setCurrentBarber(barberId);
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível identificar o barbeiro associado à sua conta.",
          variant: "destructive",
        });
        handleLogout();
      }
    } catch (error) {
      console.error("Erro ao buscar ID do barbeiro:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar informações do barbeiro.",
        variant: "destructive",
      });
    }
  };
  
  // Buscar todos os barbeiros
  const fetchBarbers = async () => {
    try {
      setLoading(true);
      const { data, error } = await getBarbers();
      
      if (error) throw error;
      
      if (data) {
        setBarbers(data);
      }
    } catch (error: any) {
      console.error("Erro ao buscar barbeiros:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar lista de barbeiros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Buscar marcações para um barbeiro específico
  const fetchAppointmentsForBarber = async (barberId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await getBarberAppointments(barberId);
      
      if (error) throw error;
      
      if (data) {
        setAppointments(data);
        filterAppointments();
      }
    } catch (error: any) {
      console.error("Erro ao buscar marcações do barbeiro:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar marcações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Buscar todas as marcações (apenas para admin)
  const fetchAllAppointments = async () => {
    try {
      setLoading(true);
      
      // Remover a parte `services (...)` da query
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          client_name,
          client_email,
          client_phone,
          appointment_date,
          start_time,
          end_time,
          status,
          notes,
          barber_id,
          service_id
        `)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        console.log("Dados dos Agendamentos Recebidos (sem services):", data);
        // Definir o estado diretamente, pois a estrutura agora corresponde (sem services)
        setAppointments(data as Appointment[]); 
      } else {
         setAppointments([]);
      }
    } catch (error: any) {
      console.error("Erro ao buscar todas as marcações:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar marcações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Filtrar as marcações baseado nos critérios selecionados
  const filterAppointments = () => {
    if (!appointments.length) {
      setFilteredAppointments([]);
      return;
    }
    
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
    
    const filtered = appointments.filter(appointment => {
      // Filtrar por data
      const dateMatch = appointment.appointment_date === formattedSelectedDate;
      
      // Filtrar por barbeiro, se não for 'all'
      const barberMatch = 
        selectedBarber === 'all' || 
        appointment.barber_id === selectedBarber;
      
      // Filtrar por termo de busca
      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        
        // Encontrar o serviço para filtro
        const serviceDetails = services.find(s => s.id === appointment.service_id);
        
        return (
          dateMatch && 
          barberMatch &&
          (appointment.client_name.toLowerCase().includes(searchTermLower) ||
           appointment.client_email.toLowerCase().includes(searchTermLower) ||
           // Filtrar pelo nome do serviço encontrado
           (serviceDetails?.name.toLowerCase().includes(searchTermLower)) || 
           appointment.start_time.includes(searchTermLower))
        );
      }
      
      return dateMatch && barberMatch;
    });
    
    setFilteredAppointments(filtered);
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/admin');
  };
  
  // Formatar o horário de 24h para exibição amigável
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };
  
  // Obter o nome do barbeiro pelo ID
  const getBarberNameById = (barberId: string) => {
    const barber = barbers.find(b => b.id === barberId);
    return barber ? barber.name : 'Barbeiro Desconhecido';
  };
  
  // Obter badge de status
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: JSX.Element }> = {
      scheduled: { 
        label: 'Agendado', 
        className: 'bg-amber-900/30 text-amber-400 border-amber-400',
        icon: <Clock className="h-3 w-3 mr-1" />
      },
      completed: { 
        label: 'Concluído', 
        className: 'bg-green-900/30 text-green-400 border-green-400',
        icon: <Check className="h-3 w-3 mr-1" />
      },
      cancelled: { 
        label: 'Cancelado', 
        className: 'bg-red-900/30 text-red-400 border-red-400',
        icon: <X className="h-3 w-3 mr-1" />
      },
      'no-show': { 
        label: 'Não Compareceu', 
        className: 'bg-blue-900/30 text-blue-400 border-blue-400',
        icon: <User className="h-3 w-3 mr-1" />
      }
    };
    
    const statusInfo = statusMap[status] || { 
      label: 'Desconhecido', 
      className: 'bg-gray-900/30 text-gray-400 border-gray-400',
      icon: <Clock className="h-3 w-3 mr-1" />
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full border flex items-center ${statusInfo.className}`}>
        {statusInfo.icon}
        {statusInfo.label}
      </span>
    );
  };

  // Atualizar status da marcação (concluir ou cancelar)
  const updateAppointmentStatus = async (appointmentId: string, newStatus: 'completed' | 'cancelled' | 'no-show') => {
    try {
      setUpdatingAppointment(appointmentId);
      
      // Usar a função RPC em vez do update direto
      const { data, error } = await supabaseUpdateStatus(appointmentId, newStatus);
      
      if (error) throw error;
      
      // Atualizar estado local
      setAppointments(appointments.map(appointment => {
        if (appointment.id === appointmentId) {
          return { ...appointment, status: newStatus };
        }
        return appointment;
      }));
      
      // Mensagem de sucesso
      const messages = {
        completed: 'Marcação concluída com sucesso!',
        cancelled: 'Marcação cancelada com sucesso!',
        'no-show': 'Marcação marcada como não compareceu!'
      };
      
      toast({
        title: "Atualização de Marcação",
        description: messages[newStatus]
      });
      
      // Recarregar as marcações após a atualização
      if (userRole === 'barber' && currentBarber) {
        fetchAppointmentsForBarber(currentBarber);
      } else if (userRole === 'admin') {
        fetchAllAppointments();
      }
      
    } catch (error: any) {
      console.error(`Erro ao atualizar marcação para ${newStatus}:`, error);
      toast({
        title: "Erro",
        description: `Não foi possível atualizar o status da marcação: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUpdatingAppointment(null);
    }
  };
  
  const handleCompleteAppointment = (appointmentId: string) => {
    updateAppointmentStatus(appointmentId, 'completed');
  };
  
  const handleCancelAppointment = (appointmentId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar esta marcação?')) {
      updateAppointmentStatus(appointmentId, 'cancelled');
    }
  };

  const handleWorkingHoursChange = async (
    day: keyof typeof workingHours, 
    field: 'open' | 'close' | 'isOpen', 
    value: string | boolean
  ) => {
    // Primeiro atualiza o estado local para feedback imediato
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
    
    // Prepara os dados para enviar ao banco de dados
    const changes: Record<string, any> = {};
    
    if (field === 'open') {
      changes.open_time = value as string;
    } else if (field === 'close') {
      changes.close_time = value as string;
    } else if (field === 'isOpen') {
      changes.is_open = value as boolean;
    }
    
    try {
      // Persiste a alteração no banco de dados
      const { error } = await updateBusinessHours(day, changes);
      
      if (error) throw error;
      
      // Feedback de sucesso
      toast({
        title: "Horário Atualizado",
        description: `O horário de ${day} foi atualizado com sucesso.`,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar horário:", error);
      toast({
        title: "Erro",
        description: `Falha ao salvar alteração: ${error.message}`,
        variant: "destructive",
      });
      
      // Reverter ao estado anterior em caso de erro
      fetchBusinessHours();
    }
  };
  
  const addHoliday = async () => {
    if (!holidayName.trim()) {
      toast({ title: "Erro", description: "Por favor, insira um nome para o feriado ou data especial.", variant: "destructive" });
      return;
    }
    if (!selectedHolidayDate) {
      toast({ title: "Erro", description: "Por favor, selecione uma data válida.", variant: "destructive" });
      return;
    }
    
    const formattedDate = format(selectedHolidayDate, 'yyyy-MM-dd');

    // Verificar se já existe feriado na mesma data
    const exists = holidaysList.some(h => h.date === formattedDate);
    
    if (exists) {
      toast({ title: "Erro", description: "Já existe um feriado ou data especial neste dia.", variant: "destructive" });
      return;
    }
    
    try {
      setSavingSettings(true);
      const { data, error } = await addClosedDay(formattedDate, holidayName);
      if (error) throw error;
      
      // Atualizar lista local APÓS sucesso
      if (data && data[0]) {
         setHolidaysList([...holidaysList, { id: data[0].id, date: data[0].date, description: data[0].description }]);
      }
     
      setHolidayName('');
      toast({ title: "Sucesso", description: "Feriado ou data especial adicionado com sucesso." });
    } catch (error: any) {
      console.error("Erro ao adicionar feriado:", error);
      toast({ title: "Erro", description: `Falha ao adicionar feriado: ${error.message}`, variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };
  
  const removeHoliday = async (index: number) => {
    const holidayToRemove = holidaysList[index];
    if (!holidayToRemove || !holidayToRemove.date) return;
    
    if (!window.confirm(`Tem certeza que deseja remover "${holidayToRemove.description}" em ${format(parseISO(holidayToRemove.date), "dd/MM/yyyy", { locale: pt })}?`)) {
      return;
    }

    try {
      setSavingSettings(true);
      const { error } = await removeClosedDay(holidayToRemove.date);
      if (error) throw error;
      
      // Atualizar lista local APÓS sucesso
      const newList = [...holidaysList];
      newList.splice(index, 1);
      setHolidaysList(newList);
      
      toast({ title: "Sucesso", description: "Feriado ou data especial removido com sucesso." });
    } catch (error: any) {
      console.error("Erro ao remover feriado:", error);
      toast({ title: "Erro", description: `Falha ao remover feriado: ${error.message}`, variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };
  
  // Modificar saveSettings para incluir salvamento de mensagens
  const saveSettings = async () => {
    setSavingSettings(true);
    let success = true;
    
    try {
      // Salvar Mensagens Automáticas
      // Usamos Promise.all para executar todas as atualizações em paralelo
      const messagePromises = Object.entries(automatedMessages).map(([type, body]) => 
        upsertMessageTemplate(type, body)
      );
      
      const results = await Promise.all(messagePromises);
      
      // Verificar se houve erro em alguma das atualizações de mensagem
      results.forEach(result => {
        if (result.error) {
          console.error("Erro ao salvar modelo de mensagem:", result.error);
          success = false;
        }
      });

      // -- Potencialmente salvar outros settings aqui no futuro --
      // Ex: await saveOtherSettings();
      
      if (success) {
        toast({
          title: "Configurações Salvas",
          description: "As configurações foram atualizadas com sucesso.",
        });
      } else {
         toast({
          title: "Erro Parcial",
          description: "Algumas configurações (mensagens) não puderam ser salvas. Verifique o console.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error("Erro geral ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações: " + error.message,
        variant: "destructive",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddService = () => {
    setIsEditMode(false);
    setCurrentService(null);
    setNewService({
      id: Math.random().toString(36).substring(2, 9), // ID temporário
      name: '',
      description: '',
      price: 0,
      duration: 30,
      isCombo: false,
      includedServices: [],
    });
    setIsDialogOpen(true);
  };
  
  const handleEditService = (service: Service) => {
    setIsEditMode(true);
    setCurrentService(service);
    setNewService({ ...service });
    setIsDialogOpen(true);
  };
  
  const handleSaveService = async () => {
    if (!newService.name || newService.price <= 0 || newService.duration <= 0) {
      toast({
        title: "Campos inválidos",
        description: "Preencha todos os campos obrigatórios corretamente.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Tentar atualizar o cache do esquema primeiro
      await refreshSchemaCache();
      
      // Dados do serviço para salvar
      const serviceData = {
        name: newService.name,
        description: newService.description,
        price: newService.price,
        duration: newService.duration,
        is_combo: newService.isCombo,
        included_services: newService.isCombo && newService.includedServices ? 
          newService.includedServices : null
      };
      
      console.log("Dados do serviço a serem salvos:", serviceData);
      
      let result;
      
      if (isEditMode && currentService) {
        // Atualizar serviço existente
        result = await updateService(currentService.id, serviceData);
        
        if (result.error) throw result.error;
        
        // Atualizar estado local
        setServices(services.map(s => s.id === currentService.id ? { ...s, ...result.data[0] } : s));
        
        // Atualizar disponibilidade para o serviço
        await updateServiceBarberAvailability(
          currentService.id, 
          serviceBarberAvailability[currentService.id] || []
        );
      } else {
        // Adicionar novo serviço
        result = await createService(serviceData);
        
        if (result.error) throw result.error;
        
        const newServiceWithId = result.data[0];
        
        // Atualizar estado local
        setServices([...services, {
          id: newServiceWithId.id,
          name: newServiceWithId.name,
          description: newServiceWithId.description,
          price: newServiceWithId.price,
          duration: newServiceWithId.duration,
          isCombo: newServiceWithId.is_combo,
          includedServices: newServiceWithId.included_services
        }]);
        
        // Inicializar disponibilidade para todos os barbeiros e salvá-la
        const barberIds = barbers.map(b => b.id);
        await updateServiceBarberAvailability(newServiceWithId.id, barberIds);
        
        // Atualizar estado local de disponibilidade
        setServiceBarberAvailability({
          ...serviceBarberAvailability,
          [newServiceWithId.id]: barberIds
        });
      }
      
      setIsDialogOpen(false);
      toast({
        title: isEditMode ? "Serviço Atualizado" : "Serviço Adicionado",
        description: isEditMode ? "O serviço foi atualizado com sucesso." : "O serviço foi adicionado com sucesso.",
      });
      
      // Recarregar serviços e disponibilidade
      fetchServices();
      fetchServiceBarberAvailability();
      
    } catch (error: any) {
      console.error("Erro ao salvar serviço:", error);
      toast({
        title: "Erro",
        description: `Falha ao ${isEditMode ? 'atualizar' : 'adicionar'} serviço: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este serviço?")) {
      setLoading(true);
      
      try {
        const { error } = await deleteService(serviceId);
        
        if (error) throw error;
        
        // Remover do estado local
        setServices(services.filter(s => s.id !== serviceId));
        
        // Remover das disponibilidades
        const newAvailability = { ...serviceBarberAvailability };
        delete newAvailability[serviceId];
        setServiceBarberAvailability(newAvailability);
        
        toast({
          title: "Serviço Excluído",
          description: "O serviço foi excluído com sucesso.",
        });
      } catch (error: any) {
        console.error("Erro ao excluir serviço:", error);
        toast({
          title: "Erro",
          description: `Falha ao excluir serviço: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };
  
  const toggleServiceAvailability = async (serviceId: string, barberId: string) => {
    const currentAvailability = serviceBarberAvailability[serviceId] || [];
    let newAvailability: string[];
    
    if (currentAvailability.includes(barberId)) {
      // Remover disponibilidade
      newAvailability = currentAvailability.filter(id => id !== barberId);
    } else {
      // Adicionar disponibilidade
      newAvailability = [...currentAvailability, barberId];
    }
    
    // Atualizar estado local
    setServiceBarberAvailability({
      ...serviceBarberAvailability,
      [serviceId]: newAvailability
    });
    
    try {
      // Verificar se a tabela existe primeiro
      const { error: checkError } = await supabase
        .from('service_barber_availability')
        .select('count(*)', { count: 'exact', head: true });
      
      // Se a tabela não existir, exibir um aviso e não tentar persistir
      if (checkError && checkError.message && checkError.message.includes('does not exist')) {
        toast({
          title: "Atenção",
          description: "A tabela de disponibilidade não existe. Execute o script SQL para criar as tabelas.",
        });
        return;
      }
      
      // Persistir no banco de dados
      const { error } = await updateServiceBarberAvailability(serviceId, newAvailability);
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Erro ao atualizar disponibilidade:", error);
      toast({
        title: "Erro",
        description: `Falha ao atualizar disponibilidade do serviço: ${error.message}`,
        variant: "destructive",
      });
      
      // Reverter alteração em caso de erro
      setServiceBarberAvailability({
        ...serviceBarberAvailability,
        [serviceId]: currentAvailability
      });
    }
  };

  // Carregar dados iniciais (incluindo mensagens)
  useEffect(() => {
    if (userRole === 'admin') {
      fetchClosedDays();
      fetchServices();
      fetchServiceBarberAvailability();
      fetchBusinessHours();
      fetchMessageTemplates(); // Chamar função para carregar mensagens
    }
  }, [userRole]);
  // Função para buscar modelos de mensagem
  const fetchMessageTemplates = async () => {
    if (initialMessagesLoaded) return; // Evitar recarregar desnecessariamente
    
    try {
      setLoading(true);
      const { data, error } = await getMessageTemplates();
      if (error) throw error;
      
      if (data && data.length > 0) {
        const templates: Record<string, string> = {};
        data.forEach(item => {
          templates[item.template_type] = item.template_body;
        });
        
        // Atualizar o estado apenas se houver dados no DB
        setAutomatedMessages(prev => ({ ...prev, ...templates })); 
        setInitialMessagesLoaded(true); // Marcar como carregado
      } else {
         // Se não houver nada no DB, talvez pré-popular com os defaults?
         console.log("Nenhum modelo de mensagem encontrado no DB, usando defaults.");
         // Poderíamos chamar upsert aqui para salvar os defaults iniciais, se desejado.
         setInitialMessagesLoaded(true); // Marcar como carregado mesmo assim
      }
      
    } catch (error: any) {
      console.error("Erro ao buscar modelos de mensagem:", error);
      toast({ title: "Erro", description: "Falha ao carregar modelos de mensagem.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Buscar todos os serviços do Supabase
  const fetchServices = async () => {
    try {
      setLoading(true);
      
      // Tentar atualizar o cache do esquema primeiro
      await refreshSchemaCache();
      
      const { data, error } = await getServices();
      
      if (error) throw error;
      
      if (data) {
        // Mapear os dados corretamente
        const formattedServices = data.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description || '',
          price: service.price || 0,
          duration: service.duration || 30,
          isCombo: service.is_combo || false,
          includedServices: service.included_services || []
        }));
        setServices(formattedServices);
      }
    } catch (error: any) {
      console.error("Erro ao buscar serviços:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar lista de serviços.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Buscar disponibilidade de serviços por barbeiro
  const fetchServiceBarberAvailability = async () => {
    try {
      const { data, error } = await getServiceBarberAvailability();
      
      // Se houver um erro como "relation does not exist", mostrar diálogo de configuração
      if (error && error.message && error.message.includes('does not exist')) {
        console.warn("Tabela de disponibilidade não encontrada. Execute o script SQL para criar as tabelas.");
        setShowDbSetupDialog(true);
        return;
      }
      
      if (error) throw error;
      
      if (data) {
        // Converter a resposta para o formato que usamos no estado
        const availabilityMap: Record<string, string[]> = {};
        
        data.forEach((item: { service_id: string; barber_id: string }) => {
          if (!availabilityMap[item.service_id]) {
            availabilityMap[item.service_id] = [];
          }
          availabilityMap[item.service_id].push(item.barber_id);
        });
        
        setServiceBarberAvailability(availabilityMap);
      }
    } catch (error: any) {
      console.error("Erro ao buscar disponibilidade de serviços:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar disponibilidade de serviços por barbeiro.",
        variant: "destructive",
      });
    }
  };

  // Carregar os horários de funcionamento do banco de dados
  const fetchBusinessHours = async () => {
    try {
      setLoading(true);
      const { data, error } = await getBusinessHours();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const hoursMap: Record<string, { open: string; close: string; isOpen: boolean }> = {};
        
        data.forEach((item) => {
          const day = item.day_of_week;
          hoursMap[day] = {
            open: item.open_time.substring(0, 5),
            close: item.close_time.substring(0, 5),
            isOpen: item.is_open
          };
        });
        
        setWorkingHours(hoursMap as typeof workingHours);
      }
    } catch (error: any) {
      console.error("Erro ao buscar horários de funcionamento:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar horários de funcionamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar feriados
  const fetchClosedDays = async () => {
    try {
      setLoading(true);
      const { data, error } = await getClosedDays();
      if (error) throw error;
      if (data) {
        // Formatar a data para exibição e armazenamento
        const formattedHolidays = data.map(day => ({
          id: day.id,
          date: day.date, // Manter formato YYYY-MM-DD
          description: day.description
        }));
        setHolidaysList(formattedHolidays);
      }
    } catch (error: any) {
      console.error("Erro ao buscar dias fechados:", error);
      toast({ title: "Erro", description: "Falha ao carregar feriados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // --- Helper Functions --- 

  // Function to generate time slots (example: 8:00 to 23:00, every 30 min)
  const generateTimeSlots = (startHour = 8, endHour = 23, interval = 30) => {
    const slots = [];
    let currentTime = new Date();
    currentTime.setHours(startHour, 0, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, 0, 0, 0);

    while (currentTime < endTime) {
      slots.push(format(currentTime, 'HH:mm'));
      currentTime.setMinutes(currentTime.getMinutes() + interval);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots(); // Generate the slots once with the new default parameters

  // --- Fetching Data --- (ensure appointments and barbers are fetched)
  // ... existing fetching logic ...

  // --- Event Handlers --- 
  const handlePreviousWeek = () => {
    setCurrentWeekStart(subDays(currentWeekStart, 7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  // New handler for clicking schedule blocks
  const handleScheduleBlockClick = (appointment: Appointment) => {
    if (!appointment || (appointment.status !== 'scheduled' && appointment.status !== 'completed')) {
      // Don't open modal for cancelled/no-show or empty slots inadvertently
      return;
    }
    
    // Prepare data for the modal (parsing dates might not be strictly needed if modal adapts)
    // Let's pass the appointment data directly for now, the modal can format
    setSelectedEventDetails({
      ...appointment,
      // We can parse dates here if modal relies on Date objects, otherwise pass strings
       start: parseISO(`${appointment.appointment_date}T${appointment.start_time}`),
       end: parseISO(`${appointment.appointment_date}T${appointment.end_time}`),
    });
    setIsEventModalOpen(true);
  };

  // ... (rest of the code, including the Horarios table render) ...

  // --- JSX --- 

  // --- Status Update Handling ---
  // Define requestStatusUpdate in the component scope
  const requestStatusUpdate = (id: string, status: Appointment['status']) => {
    setStatusUpdateInfo({ id, status });
    setIsStatusConfirmOpen(true);
    setIsEventModalOpen(false); // Close the details modal when confirmation opens
  };

  // Define confirmStatusUpdate (should already exist or be similar)
  const confirmStatusUpdate = async () => {
    if (!statusUpdateInfo) return;

    const { id, status } = statusUpdateInfo;
    
    // Only call updateAppointmentStatus if the status is a valid action
    if (status === 'completed' || status === 'cancelled' || status === 'no-show') {
      await updateAppointmentStatus(id, status); 
    } else {
      console.warn(`Attempted to update status to an invalid action state: ${status}`);
      // Optionally show a toast error here if needed
    }
    
    // Reset confirmation state regardless of whether the update was called
    setIsStatusConfirmOpen(false);
    setStatusUpdateInfo(null);
  };

  // --- Reporting Functions ---
  const generateReport = async () => {
    if (!reportStartDate || !reportEndDate) {
      toast({ title: "Erro", description: "Selecione a data de início e fim para o relatório.", variant: "destructive" });
      return;
    }
    if (reportEndDate < reportStartDate) {
      toast({ title: "Erro", description: "A data de fim deve ser posterior à data de início.", variant: "destructive" });
      return;
    }

    setIsGeneratingReport(true);
    setReportData(null); // Clear previous report

    try {
      const startDateStr = format(reportStartDate, 'yyyy-MM-dd');
      const endDateStr = format(reportEndDate, 'yyyy-MM-dd');

      // Fetch appointments within the date range
      const { data: reportAppointments, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          id,
          status,
          barber_id,
          service_id
        `)
        .gte('appointment_date', startDateStr)
        .lte('appointment_date', endDateStr);

      if (fetchError) throw new Error(`Erro ao buscar agendamentos para o relatório: ${fetchError.message}`);
      if (!reportAppointments) throw new Error("Nenhum agendamento encontrado para o período.");

      // Ensure services and barbers state are populated (might already be from initial load)
      if (services.length === 0 || barbers.length === 0) {
         await fetchServices(); // Or call your main data fetching function if needed
         await fetchBarbers(); 
         // Small delay to allow state update, or use a more robust check
         await new Promise(resolve => setTimeout(resolve, 100)); 
      }

      // Process data
      let totalRevenue = 0;
      const revenuePerBarber: ReportData['revenuePerBarber'] = {};
      const revenuePerService: ReportData['revenuePerService'] = {};
      let cancelledCount = 0;

      // Initialize maps based on current barbers and services
      barbers.forEach(b => { revenuePerBarber[b.id] = { name: b.name, revenue: 0 }; });
      services.forEach(s => { revenuePerService[s.id] = { name: s.name, revenue: 0, count: 0 }; });

      for (const app of reportAppointments) {
        if (app.status === 'completed') {
          const service = services.find(s => s.id === app.service_id);
          if (service) {
            const price = service.price || 0;
            totalRevenue += price;
            
            // Add to barber revenue (if barber exists)
            if (revenuePerBarber[app.barber_id]) {
                revenuePerBarber[app.barber_id].revenue += price;
            }

            // Add to service revenue and count (if service exists)
            if (revenuePerService[app.service_id]) {
                 revenuePerService[app.service_id].revenue += price;
                 revenuePerService[app.service_id].count += 1;
            }
          }
        } else if (app.status === 'cancelled') {
          cancelledCount += 1;
        }
      }

      setReportData({
        totalRevenue,
        revenuePerBarber,
        revenuePerService,
        cancelledCount,
        startDate: startDateStr,
        endDate: endDateStr
      });

      toast({ title: "Sucesso", description: "Relatório gerado." });

    } catch (error: any) {
      console.error("Erro ao gerar relatório:", error);
      toast({ title: "Erro ao Gerar Relatório", description: error.message, variant: "destructive" });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const exportReportToCSV = () => {
    if (!reportData) {
      toast({ title: "Erro", description: "Gere um relatório antes de exportar.", variant: "destructive" });
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";

    // --- Summary --- 
    csvContent += "Resumo do Periodo\r\n";
    csvContent += `Data Inicio:,${reportData.startDate}\r\n`;
    csvContent += `Data Fim:,${reportData.endDate}\r\n`;
    csvContent += `Faturamento Total (Concluidos):,€ ${reportData.totalRevenue.toFixed(2)}\r\n`;
    csvContent += `Agendamentos Cancelados:,${reportData.cancelledCount}\r\n`;
    csvContent += "\r\n"; // Blank line

    // --- Revenue Per Barber --- 
    csvContent += "Faturamento por Barbeiro\r\n";
    csvContent += "Barbeiro,Faturamento (€)\r\n";
    Object.values(reportData.revenuePerBarber).forEach(barber => {
      csvContent += `"${barber.name}",${barber.revenue.toFixed(2)}\r\n`;
    });
    csvContent += "\r\n";

    // --- Revenue and Count Per Service --- 
    csvContent += "Desempenho por Servico (Concluidos)\r\n";
    csvContent += "Servico,Quantidade,Faturamento (€)\r\n";
    Object.values(reportData.revenuePerService).forEach(service => {
      csvContent += `"${service.name}",${service.count},${service.revenue.toFixed(2)}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_barbearia_${reportData.startDate}_a_${reportData.endDate}.csv`);
    document.body.appendChild(link); // Required for FF

    link.click();
    document.body.removeChild(link);
  };

  // --- Client Stats Functions ---
  const generateClientStats = async () => {
    setIsLoadingClientStats(true);
    setClientStats(null); // Clear previous stats

    try {
      // Fetch all completed appointments to analyze client activity
      const { data: completedAppointments, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          id,
          client_name,
          client_phone,
          client_email,
          status
        `)
        .eq('status', 'completed');

      if (fetchError) throw new Error(`Erro ao buscar agendamentos concluídos: ${fetchError.message}`);
      if (!completedAppointments) {
          setClientStats({ totalActiveClients: 0, topClients: [] }); // Set empty stats
          setIsLoadingClientStats(false);
          return;
      }

      // Process data to find unique clients and count visits
      const clientVisitCount: Record<string, { name: string; phone?: string; email?: string; visits: number }> = {};

      for (const app of completedAppointments) {
        // Create a unique key for the client (e.g., using phone or email if available, otherwise name)
        // This is an approximation if no unique client ID exists
         const clientKey = (
             app.client_phone || 
             app.client_email || 
             app.client_name?.toLowerCase() || 
             `unknown-${app.id}` // Fallback, shouldn't happen often
         );

        if (!clientVisitCount[clientKey]) {
          clientVisitCount[clientKey] = { 
              name: app.client_name || 'Nome Desconhecido', 
              phone: app.client_phone, 
              email: app.client_email, 
              visits: 0 
          };
        }
        clientVisitCount[clientKey].visits += 1;
      }

      const totalActiveClients = Object.keys(clientVisitCount).length;

      // Get top clients (e.g., top 10)
      const sortedClients = Object.values(clientVisitCount).sort((a, b) => b.visits - a.visits);
      const topClients = sortedClients.slice(0, 10); 

      setClientStats({
        totalActiveClients,
        topClients
      });

    } catch (error: any) {
      console.error("Erro ao gerar estatísticas de clientes:", error);
      toast({ title: "Erro ao Gerar Estatísticas", description: error.message, variant: "destructive" });
       setClientStats({ totalActiveClients: 0, topClients: [] }); // Set empty stats on error
    } finally {
      setIsLoadingClientStats(false);
    }
  };

   // Load client stats when the section becomes active
   useEffect(() => {
     if (activeSection === 'clients' && !clientStats && !isLoadingClientStats) {
       generateClientStats();
     }
   }, [activeSection, clientStats, isLoadingClientStats]); // Add dependencies

  // Handler for adding a new barber
  const handleAddBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingBarber(true);
    console.log("Adding barber:", newBarber);

    try {
      const { data, error } = await createBarber(newBarber); // Ensure createBarber accepts profile_image_url
      if (error) throw error;
      
      // Update local state and show success
      if (data && data.id) { 
         setBarbers([...barbers, data]); // Add the newly created barber (with ID) to the state
      } else {
         // Fetch barbers again if the returned data is not as expected (fallback)
         console.warn("Create barber didn't return expected data, refetching list.");
         fetchBarbers(); 
      }
      toast({ title: "Sucesso", description: "Barbeiro adicionado." });
      setIsBarberDialogOpen(false);
      setNewBarber({ name: '', email: '', phone: '', profile_image_url: '' }); // Reset form
      
    } catch (error: any) {
      console.error("Error adding barber:", error);
      toast({ title: "Erro", description: error.message || "Falha ao adicionar barbeiro.", variant: "destructive" });
    } finally {
      setAddingBarber(false);
    }
  };

  // Handle edit barber function
  const handleEditBarber = (barber: Barber) => {
    setEditingBarber(barber);
    setIsEditBarberDialogOpen(true);
  };

  // Handle update barber
  const handleUpdateBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBarber) return;
    
    setAddingBarber(true);
    
    try {
      const { data, error } = await updateBarber(editingBarber.id, editingBarber);
      if (error) throw error;
      
      // Update local state
      setBarbers(barbers.map(b => b.id === editingBarber.id ? editingBarber : b));
      
      toast({ title: "Sucesso", description: "Barbeiro atualizado." });
      setIsEditBarberDialogOpen(false);
      setEditingBarber(null);
    } catch (error: any) {
      console.error("Error updating barber:", error);
      toast({ title: "Erro", description: error.message || "Falha ao atualizar barbeiro.", variant: "destructive" });
    } finally {
      setAddingBarber(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (barberId: string) => {
    setDeletingBarber(barberId);
    setIsDeleteConfirmOpen(true);
  };

  // Handle actual deletion
  const handleDeleteBarber = async () => {
    if (!deletingBarber) return;
    
    setAddingBarber(true); // Reutilizar o estado de loading
    
    try {
      const { error } = await deleteBarber(deletingBarber);
      
      if (error) throw error;
      
      // Remover o barbeiro do estado local
      setBarbers(barbers.filter(b => b.id !== deletingBarber));
      
      // Fechar o diálogo e resetar o estado
      setIsDeleteConfirmOpen(false);
      setDeletingBarber(null);
      
      toast({
        title: "Barbeiro Excluído",
        description: "O barbeiro foi excluído com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao excluir barbeiro:", error);
      toast({
        title: "Erro",
        description: `Falha ao excluir barbeiro: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setAddingBarber(false);
    }
  };

  // ... existing code ...
  const [selectedBarberForHours, setSelectedBarberForHours] = useState<string | null>(null);
  const [barberWorkingHours, setBarberWorkingHours] = useState([]);
  const [loadingBarberHours, setLoadingBarberHours] = useState(false);
  
  // Estado para os feriados e dias fechados
  // ... existing code ...

  // Buscar horários de trabalho para um barbeiro específico
  const fetchBarberHours = async (barberId: string) => {
    if (!barberId) {
      setBarberWorkingHours([]); // Limpar horários se nenhum barbeiro for selecionado
      return;
    }
    setLoadingBarberHours(true);
    try {
      const { data, error } = await getBarberWorkingHours(barberId);
      if (error) throw error;
      setBarberWorkingHours(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar horários do barbeiro:", error);
      toast({
        title: "Erro",
        description: `Falha ao carregar horários do barbeiro: ${error.message}`,
        variant: "destructive",
      });
      setBarberWorkingHours([]); // Limpar em caso de erro
    } finally {
      setLoadingBarberHours(false);
    }
  };
  
  // Helper function to get day name in Portuguese
  const getDayName = (dayOfWeek: number): string => {
    const names = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    // Adjust index based on DOW (1-7) used in barber_working_hours
    return names[dayOfWeek % 7]; // 7 % 7 = 0 (Sunday), 1 % 7 = 1 (Monday), etc.
  };

  // Atualizar horário de trabalho do barbeiro
  const handleUpdateBarberHour = async (dayOfWeek: number, startTime: string, endTime: string) => {
    if (!selectedBarberForHours) return;

    setLoadingBarberHours(true);
    try {
      let result;
      // If both start and end are empty, delete the entry
      if (!startTime && !endTime) {
        console.log(`Removendo horário para barbeiro ${selectedBarberForHours} no dia ${dayOfWeek}`);
        result = await deleteBarberWorkingHour(selectedBarberForHours, dayOfWeek);
        if (result.error && result.error.code !== 'PGRST116') { // Ignorar erro se não encontrar (já não existe)
           throw result.error;
        }
        // Remove from local state
        setBarberWorkingHours(prev => prev.filter(h => h.day_of_week !== dayOfWeek));
        toast({ title: "Horário Removido", description: `Horário de ${getDayName(dayOfWeek)} removido.` });
      } else if (startTime && endTime) {
         // Check if start time is before end time
         if (startTime >= endTime) {
           toast({ title: "Erro de Validação", description: "A hora de início deve ser anterior à hora de fim.", variant: "destructive"});
           setLoadingBarberHours(false);
           return; // Não prosseguir
         }
         console.log(`Atualizando/Criando horário para barbeiro ${selectedBarberForHours} no dia ${dayOfWeek} para ${startTime} - ${endTime}`);
        // Upsert the entry (will create if not exists, update if exists)
        result = await updateBarberWorkingHour(selectedBarberForHours, dayOfWeek, startTime, endTime);
        if (result.error) throw result.error;
        // Update local state
        const updatedHour = result.data?.[0];
        if (updatedHour) {
          setBarberWorkingHours(prev => {
            const existingIndex = prev.findIndex(h => h.day_of_week === dayOfWeek);
            if (existingIndex > -1) {
              // Atualiza o existente
              const newState = [...prev];
              newState[existingIndex] = updatedHour;
              return newState;
            } else {
              // Adiciona o novo
              return [...prev, updatedHour].sort((a, b) => a.day_of_week - b.day_of_week);
            }
          });
        }
         toast({ title: "Horário Atualizado", description: `Horário de ${getDayName(dayOfWeek)} atualizado com sucesso.` });
      } else {
        // If only one is set, it's an invalid state (shouldn't happen with the UI logic)
         toast({ title: "Erro", description: "Defina a hora de início e fim, ou remova o horário.", variant: "destructive"});
      }

    } catch (error: any) {
      console.error("Erro ao atualizar horário do barbeiro:", error);
      toast({
        title: "Erro Inesperado",
        description: `Falha ao atualizar horário: ${error.message}`,
        variant: "destructive",
      });
      // Recarregar para garantir consistência após erro
      if(selectedBarberForHours) fetchBarberHours(selectedBarberForHours);
    } finally {
      setLoadingBarberHours(false);
    }
  };
  
  // Configurar horários padrão para o barbeiro selecionado
  const handleSetupDefaultHours = async () => {
    if (!selectedBarberForHours) {
      toast({
        title: "Aviso",
        description: "Selecione um barbeiro primeiro.",
        variant: "default", // Usar default ou destructive?
      });
      return;
    }
    
    if (!window.confirm(`Tem certeza que deseja aplicar o horário padrão para este barbeiro? Os horários atuais serão substituídos.`)) {
        return;
    }
    
    setLoadingBarberHours(true);
    try {
      const { data, error } = await setupDefaultWorkingHours(selectedBarberForHours);
      if (error) throw error;
      
      // Recarregar os horários para refletir as mudanças
      if (data) {
        setBarberWorkingHours(data.sort((a, b) => a.day_of_week - b.day_of_week));
      }
      
      toast({
        title: "Sucesso",
        description: "Horários padrão configurados com sucesso."
      });
    } catch (error: any) {
      console.error("Erro ao definir horários padrão:", error);
      toast({
        title: "Erro",
        description: `Falha ao definir horários padrão: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingBarberHours(false);
    }
  };

  // ... rest of the component ...
  
    // Add BarberWorkingHour to imports if not already there
    // Ensure necessary states are defined: selectedBarberForHours, barberWorkingHours, loadingBarberHours
    // Ensure functions are defined: fetchBarberHours, getDayName, handleUpdateBarberHour, handleSetupDefaultHours

  // Ensure type definition for workingHours state exists or is defined here
  type WorkingHoursMap = typeof workingHours; 

  // ---> DEFINE THE HELPER MAP HERE <--- 
  const dayOfWeekToStringKey: { [key: number]: keyof WorkingHoursMap } = {
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
    7: 'sunday',
  };

  // Adicionar um useEffect para carregar os dados do dashboard quando o componente for montado ou o timeRange mudar
  useEffect(() => {
    if (activeSection === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeSection, timeRange]);

  // Adicionar função para buscar dados do dashboard
  const fetchDashboardData = async () => {
    try {
      setLoadingDashboard(true);
      const data = await getDashboardData(timeRange);
      setDashboardData(data);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoadingDashboard(false);
    }
  };

  return (
    <div className="min-h-screen bg-barber">
      {/* Admin Header */}
      <header className="bg-barber-dark shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center">
              <span className="text-barber-gold font-playfair text-xl font-bold">STUDIO</span>
              <span className="text-white font-playfair text-xl font-bold">53</span>
            </div>
            
            <div className="ml-6 text-white">
              {userRole === 'admin' && <span className="bg-barber-gold text-black px-2 py-1 rounded text-xs">Admin</span>}
              {userRole === 'barber' && 
                <span className="bg-barber-gold text-black px-2 py-1 rounded text-xs">
                  Barbeiro: {currentBarber ? getBarberNameById(currentBarber) : ''}
                </span>
              }
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-barber-gold text-barber-gold hover:bg-barber-gold hover:text-black"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex container mx-auto px-4 py-8 min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-64 bg-barber-light rounded-lg p-4 mr-6 h-fit">
          <h2 className="text-xl font-bold mb-4 text-white">Painel Admin</h2>
          <nav className="space-y-2">
            <Button
              variant="ghost"
              className={`w-full justify-start ${activeSection === 'dashboard' 
                ? 'bg-barber-gold text-black' 
                : 'text-barber-gray hover:text-white hover:bg-barber-dark'}`}
              onClick={() => setActiveSection('dashboard')}
            >
              <BarChart className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button 
              variant="ghost"
              className={`w-full justify-start ${activeSection === 'appointments' 
                ? 'bg-barber-gold text-black' 
                : 'text-barber-gray hover:text-white hover:bg-barber-dark'}`}
              onClick={() => setActiveSection('appointments')}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Agendamentos
            </Button>
            {/* Add Horarios Button */}
            <Button
              variant="ghost"
              className={`w-full justify-start ${activeSection === 'horarios' 
                ? 'bg-barber-gold text-black' 
                : 'text-barber-gray hover:text-white hover:bg-barber-dark'}`}
              onClick={() => setActiveSection('horarios')}
            >
              <UsersRound className="mr-2 h-4 w-4" /> {/* Use new icon */}
              Horários
            </Button>
            {userRole === 'admin' && (
              <>
                {/* Add Barbers Button */}
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeSection === 'barbers' 
                    ? 'bg-barber-gold text-black' 
                    : 'text-barber-gray hover:text-white hover:bg-barber-dark'}`}
                  onClick={() => setActiveSection('barbers')}
                >
                  <CircleUserRound className="mr-2 h-4 w-4" />
                  Barbeiros
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeSection === 'services' 
                    ? 'bg-barber-gold text-black' 
                    : 'text-barber-gray hover:text-white hover:bg-barber-dark'}`}
                  onClick={() => setActiveSection('services')}
                >
                  <Scissors className="mr-2 h-4 w-4" />
                  Serviços
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeSection === 'settings' 
                    ? 'bg-barber-gold text-black' 
                    : 'text-barber-gray hover:text-white hover:bg-barber-dark'}`}
                  onClick={() => setActiveSection('settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Button>
              </>
            )}
            <li>
              <Button
                variant="ghost"
                // Remove disabled attribute
                className={`w-full justify-start text-left ${activeSection === 'reports' 
                  ? 'bg-barber-gold text-black' 
                  : 'text-barber-gray hover:text-white hover:bg-barber-dark'}`}
                onClick={() => setActiveSection('reports')}
              >
                <FileText className="mr-2 h-4 w-4" /> Relatórios
              </Button>
            </li>
            <Button
              variant="ghost"
              // Remove disabled attribute
              className={`w-full justify-start text-left ${activeSection === 'clients' 
                ? 'bg-barber-gold text-black' 
                : 'text-barber-gray hover:text-white hover:bg-barber-dark'}`}
              onClick={() => setActiveSection('clients')}
            >
              <Users className="mr-2 h-4 w-4" /> Clientes
            </Button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {activeSection === 'appointments' && (
            <>
              <h1 className="text-3xl font-bold mb-8">Agendamentos</h1>
        
        {/* Date Navigation, Barber Selection and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-barber-light rounded-lg p-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevDay}
              className="h-8 w-8 border-barber-gray"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-barber-gold" />
              <span className="font-medium">
                      {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: pt })}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextDay}
              className="h-8 w-8 border-barber-gray"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
                {/* Seção de barbeiro (apenas para admin) */}
                {userRole === 'admin' && (
                  <div className="bg-barber-light rounded-lg p-4 flex items-center justify-center space-x-4 overflow-x-auto">
            <Button
              variant={selectedBarber === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedBarber('all')}
              className={selectedBarber === 'all' ? 'bg-barber-gold text-black' : 'border-barber-gold text-barber-gold'}
            >
              Todos
            </Button>
            {barbers.map((barber) => (
              <Button
                key={barber.id}
                variant={selectedBarber === barber.id ? 'default' : 'outline'}
                onClick={() => setSelectedBarber(barber.id)}
                className={selectedBarber === barber.id ? 'bg-barber-gold text-black' : 'border-barber-gold text-barber-gold'}
              >
                {barber.name}
              </Button>
            ))}
          </div>
                )}
                
                {/* Preenchimento para layout quando barbeiro estiver logado */}
                {userRole === 'barber' && (
                  <div className="bg-barber-light rounded-lg p-4 flex items-center justify-center">
                    <p className="text-barber-gold">Suas Marcações</p>
                  </div>
                )}
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-barber-gray" />
            <Input
              placeholder="Procurar por cliente, serviço ou horário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-barber-light border-barber focus:border-barber-gold"
            />
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-barber-light rounded-lg overflow-hidden">
                {loading ? (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-barber-gold mx-auto"></div>
                    <p className="mt-4 text-barber-gray">Carregando marcações...</p>
                  </div>
                ) : filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-barber-dark text-barber-gold border-b border-barber">
                    <th className="text-left py-3 px-4">Horário</th>
                    <th className="text-left py-3 px-4">Cliente</th>
                    <th className="text-left py-3 px-4">Serviço</th>
                          {userRole === 'admin' && (
                    <th className="text-left py-3 px-4">Barbeiro</th>
                          )}
                    <th className="text-left py-3 px-4">Preço</th>
                          <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Contato</th>
                    <th className="text-left py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                        {filteredAppointments.map(appointment => (
                          <tr 
                            key={appointment.id} 
                            className="border-b border-[#333] hover:bg-barber-dark/30 transition-colors"
                          >
                            <td className="py-3 px-4">
                        <div className="flex items-center">
                                <Clock className="h-4 w-4 text-barber-gold mr-2" />
                                <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                        </div>
                      </td>
                            <td className="py-3 px-4">
                        <div className="flex items-center">
                                <User className="h-4 w-4 text-barber-gold mr-2" />
                                <span>{appointment.client_name}</span>
                        </div>
                      </td>
                            <td className="py-3 px-4">
                        <div className="flex items-center">
                                <Scissors className="h-4 w-4 text-barber-gold mr-2" />
                                {/* Encontrar serviço pelo ID aqui também */}
                                <span>{services.find(s => s.id === appointment.service_id)?.name || 'Serviço não encontrado'}</span>
                        </div>
                      </td>
                            {userRole === 'admin' && (
                              <td className="py-3 px-4">
                                {getBarberNameById(appointment.barber_id)}
                              </td>
                            )}
                            <td className="py-3 px-4">
                              {/* Encontrar preço do serviço pelo ID */}
                              <span className="text-barber-gold">{services.find(s => s.id === appointment.service_id)?.price || '0'} €</span>
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(appointment.status)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col space-y-1">
                                <div className="flex items-center text-xs">
                                  <Phone className="h-3 w-3 text-barber-gray mr-1" />
                                  <span>{appointment.client_phone}</span>
                                </div>
                                <div className="text-xs text-barber-gray truncate max-w-[150px]">
                                  {appointment.client_email}
                                </div>
                        </div>
                      </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                {appointment.status === 'scheduled' && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="text-xs border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
                                      onClick={() => handleCompleteAppointment(appointment.id)}
                                      disabled={updatingAppointment === appointment.id}
                                    >
                                      {updatingAppointment === appointment.id ? 'Atualizando...' : 'Concluir'}
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="text-xs border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
                                      onClick={() => handleCancelAppointment(appointment.id)}
                                      disabled={updatingAppointment === appointment.id}
                                    >
                                      {updatingAppointment === appointment.id ? 'Atualizando...' : 'Cancelar'}
                                    </Button>
                                  </>
                                )}
                        </div>
                      </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Calendar className="h-16 w-16 text-barber-gray mx-auto" />
                    <h3 className="mt-4 text-xl font-bold">Sem Marcações</h3>
                    <p className="mt-2 text-barber-gray">
                      Não há marcações para este dia {selectedBarber !== 'all' && 'e este barbeiro'}.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeSection === 'dashboard' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard & Estatísticas</h1>
                
                <div className="flex items-center">
                  <span className="mr-2 text-barber-gray">Período:</span>
                  <Select 
                    value={timeRange}
                    onValueChange={(value) => setTimeRange(value as 'weekly' | 'monthly' | 'yearly')}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {loadingDashboard ? (
                <div className="flex justify-center items-center h-[50vh]">
                  <Loader2 className="w-10 h-10 text-barber-gold animate-spin" />
                  <span className="ml-2 text-barber-gray">Carregando dados...</span>
                </div>
              ) : !dashboardData ? (
                <div className="text-center py-16">
                  <p className="text-barber-gray">Não foi possível carregar os dados do dashboard.</p>
                  <Button 
                    onClick={fetchDashboardData} 
                    className="mt-4 bg-barber-gold hover:bg-barber-gold/90 text-black"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              ) : (
                <>
                  {/* Cards de métricas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-barber-light border-[#333]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium flex items-center">
                          <Calendar className="mr-2 h-5 w-5 text-barber-gold" />
                          Total de Agendamentos
                        </CardTitle>
                        <CardDescription>
                          {timeRange === 'weekly' && 'Últimos 7 dias'}
                          {timeRange === 'monthly' && 'Últimos 30 dias'}
                          {timeRange === 'yearly' && 'Últimos 12 meses'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <div className="text-4xl font-bold text-barber-gold">
                            {dashboardData.totalBookings[timeRange]}
                          </div>
                          {/* Indicador de tendência */}
                          <div className="ml-3 flex items-center">
                            {dashboardData.trends.bookings > 0 ? (
                              <div className="flex items-center text-green-500">
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">+{dashboardData.trends.bookings}%</span>
                              </div>
                            ) : dashboardData.trends.bookings < 0 ? (
                              <div className="flex items-center text-red-500">
                                <ArrowDownRight className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">{dashboardData.trends.bookings}%</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-barber-gray">
                                <Minus className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">0%</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-barber-gray mt-2">
                          {timeRange === 'weekly' && `~${Math.round(dashboardData.totalBookings.weekly / 7)} por dia`}
                          {timeRange === 'monthly' && `~${Math.round(dashboardData.totalBookings.monthly / 30)} por dia`}
                          {timeRange === 'yearly' && `~${Math.round(dashboardData.totalBookings.yearly / 365)} por dia`}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-barber-light border-[#333]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium flex items-center">
                          <BarChart className="mr-2 h-5 w-5 text-barber-gold" />
                          Faturamento
                        </CardTitle>
                        <CardDescription>
                          {timeRange === 'weekly' && 'Esta semana'}
                          {timeRange === 'monthly' && 'Este mês'}
                          {timeRange === 'yearly' && 'Este ano'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <span className="text-4xl font-bold text-barber-gold">
                            {dashboardData.financials[timeRange].actual}€
                          </span>
                          {/* Indicador de tendência */}
                          <div className="ml-3 flex items-center">
                            {dashboardData.trends.revenue > 0 ? (
                              <div className="flex items-center text-green-500">
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">+{dashboardData.trends.revenue}%</span>
                              </div>
                            ) : dashboardData.trends.revenue < 0 ? (
                              <div className="flex items-center text-red-500">
                                <ArrowDownRight className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">{dashboardData.trends.revenue}%</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-barber-gray">
                                <Minus className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">0%</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-baseline mt-1">
                          <span className="text-sm text-barber-gray">
                            / {dashboardData.financials[timeRange].projected}€ meta
                          </span>
                        </div>
                        
                        {/* Calcular progresso e definir cor apropriada */}
                        {(() => {
                          const progress = dashboardData.financials[timeRange].actual / dashboardData.financials[timeRange].projected;
                          const percentage = Math.min(Math.round(progress * 100), 100);
                          
                          // Definir cor baseada no progresso
                          let color = 'bg-yellow-300'; // padrão
                          if (percentage < 40) color = 'bg-red-500';
                          else if (percentage < 70) color = 'bg-amber-500';
                          else if (percentage >= 100) color = 'bg-green-500';
                          
                          return (
                            <React.Fragment>
                              <div className="flex justify-between text-xs mt-1 mb-1">
                                <span className="text-barber-gray">{percentage}% concluído</span>
                                <span className={percentage >= 100 ? 'text-green-500' : 'text-barber-gray'}>
                                  {percentage >= 100 ? 'Meta atingida!' : `Faltam ${dashboardData.financials[timeRange].projected - dashboardData.financials[timeRange].actual}€`}
                                </span>
                              </div>
                              <div className="w-full bg-barber-dark/20 h-2 rounded-full mt-1">
                                <div 
                                  className={`${color} h-2 rounded-full transition-all duration-500`} 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </React.Fragment>
                          );
                        })()}
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-barber-light border-[#333]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium flex items-center">
                          <Clock className="mr-2 h-5 w-5 text-barber-gold" />
                          Hora de Pico
                        </CardTitle>
                        <CardDescription>
                          Horário com mais agendamentos
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-barber-gold">
                          {dashboardData.peakHours.length > 0 
                            ? dashboardData.peakHours.reduce((a, b) => a.bookings > b.bookings ? a : b).hour 
                            : 'N/A'}
                        </div>
                        <p className="text-sm text-barber-gray mt-2">
                          {dashboardData.peakHours.length > 0 
                            ? `${dashboardData.peakHours.reduce((a, b) => a.bookings > b.bookings ? a : b).bookings} agendamentos` 
                            : 'Sem dados disponíveis'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Serviços Populares e Horas de Pico */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="bg-barber-light border-[#333]">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                          <Scissors className="mr-2 h-5 w-5 text-barber-gold" />
                          Serviços Mais Populares
                        </CardTitle>
                        <CardDescription>
                          Distribuição por serviço
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {dashboardData.popularServices.length === 0 ? (
                          <p className="text-center text-barber-gray py-6">Sem dados de serviços disponíveis</p>
                        ) : (
                          <div className="space-y-4">
                            {dashboardData.popularServices.map((service, index) => {
                              // Array de cores para os serviços (tons dourados e âmbar)
                              const serviceColors = [
                                'bg-amber-600',
                                'bg-amber-500',
                                'bg-yellow-500',
                                'bg-yellow-400',
                                'bg-yellow-300'
                              ];
                              
                              return (
                                <div key={index}>
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center">
                                      <div className={`w-3 h-3 rounded-full ${serviceColors[index % serviceColors.length]} mr-2`}></div>
                                      <span className="font-medium text-sm">{service.name}</span>
                                    </div>
                                    <span className="text-barber-gold font-medium text-sm">
                                      {service.count} ({service.percentage}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-barber-dark/20 h-2 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-2 rounded-full ${serviceColors[index % serviceColors.length]}`} 
                                      style={{ width: `${service.percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-barber-light border-[#333]">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                          <Clock className="mr-2 h-5 w-5 text-barber-gold" />
                          Horas de Pico
                        </CardTitle>
                        <CardDescription>
                          Distribuição de agendamentos por hora
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {dashboardData.peakHours.length === 0 ? (
                          <p className="text-center text-barber-gray py-6">Sem dados de horários disponíveis</p>
                        ) : (
                          <div className="space-y-1">
                            {dashboardData.peakHours.map((hour, i) => {
                              // Calcular o máximo de agendamentos para normalizar a largura das barras
                              const maxBookings = Math.max(...dashboardData.peakHours.map(h => h.bookings));
                              // Calcular porcentagem relativa ao máximo
                              const percentage = (hour.bookings / maxBookings) * 100;
                              // Calcular cor baseada na porcentagem (de amarelo claro a dourado escuro)
                              const intensity = Math.round(30 + (percentage * 0.7));
                              const color = `hsl(43, 90%, ${intensity}%)`;
                              
                              return (
                                <div key={i} className="flex items-center mb-2">
                                  <span className="w-14 text-sm font-medium">{hour.hour}</span>
                                  <div className="flex-1 bg-barber-dark/20 h-6 rounded-md overflow-hidden">
                                    <div 
                                      className="h-full flex items-center px-2 rounded-md transition-all duration-300"
                                      style={{ 
                                        width: `${percentage}%`,
                                        background: color,
                                        minWidth: hour.bookings > 0 ? '30px' : '0',
                                      }}
                                    >
                                      <span className={`text-xs font-medium ${intensity > 50 ? 'text-black' : 'text-white'}`}>
                                        {hour.bookings}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Clientes Frequentes */}
                  <Card className="bg-barber-light border-[#333] mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl">
                        <User className="mr-2 h-5 w-5 text-barber-gold" />
                        Clientes Mais Frequentes
                      </CardTitle>
                      <CardDescription>
                        Clientes com mais visitas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dashboardData.topClients.length === 0 ? (
                        <p className="text-center text-barber-gray py-6">Sem dados de clientes disponíveis</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-[#333]">
                                <th className="text-left py-2 px-4">Cliente</th>
                                <th className="text-left py-2 px-4">Visitas</th>
                                <th className="text-left py-2 px-4">Total Gasto</th>
                                <th className="text-left py-2 px-4">Média p/ Visita</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dashboardData.topClients.map((client, i) => (
                                <tr key={i} className="border-b border-[#333] hover:bg-barber-dark/30">
                                  <td className="py-3 px-4">{client.name}</td>
                                  <td className="py-3 px-4">{client.visits}</td>
                                  <td className="py-3 px-4 text-barber-gold">{client.totalSpent}€</td>
                                  <td className="py-3 px-4">{Math.round(client.totalSpent / client.visits)}€</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {activeSection === 'services' && userRole === 'admin' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Gerenciamento de Serviços</h1>
                
                <Button
                  className="bg-barber-gold hover:bg-barber-gold/90 text-black"
                  onClick={handleAddService}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Serviço
                </Button>
              </div>
              
              {/* Lista de Serviços */}
              <Card className="bg-barber-light border-[#333] mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Scissors className="mr-2 h-5 w-5 text-barber-gold" />
                    Serviços Disponíveis
                  </CardTitle>
                  <CardDescription>
                    Gerencie os serviços oferecidos pela barbearia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {services.length === 0 ? (
                    <p className="text-center text-barber-gray py-6">
                      Nenhum serviço cadastrado. Adicione um serviço para começar.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#333]">
                            <th className="text-left py-3 px-4">Nome</th>
                            <th className="text-left py-3 px-4">Descrição</th>
                            <th className="text-center py-3 px-4">Preço</th>
                            <th className="text-center py-3 px-4">Duração</th>
                            <th className="text-center py-3 px-4">Tipo</th>
                            <th className="text-right py-3 px-4">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {services.map(service => (
                            <tr key={service.id} className="border-b border-[#333] hover:bg-barber-dark/30">
                              <td className="py-3 px-4 font-medium">{service.name}</td>
                              <td className="py-3 px-4 text-barber-gray max-w-[250px] truncate">
                                {service.description}
                      </td>
                              <td className="py-3 px-4 text-center text-barber-gold">{service.price}€</td>
                              <td className="py-3 px-4 text-center">{service.duration} min</td>
                              <td className="py-3 px-4 text-center">
                                {service.isCombo ? (
                                  <span className="bg-indigo-900/30 text-indigo-400 text-xs px-2 py-1 rounded-full border border-indigo-400">
                                    Combo
                                  </span>
                                ) : (
                                  <span className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full border border-green-400">
                                    Serviço
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end space-x-2">
                          <Button 
                            size="sm" 
                                    variant="outline"
                                    className="text-xs border-barber-gold text-barber-gold hover:bg-barber-gold/10"
                                    onClick={() => handleEditService(service)}
                          >
                                    Editar
                          </Button>
                          <Button 
                            size="sm"
                                    variant="outline"
                                    className="text-xs border-red-500 text-red-500 hover:bg-red-500/10"
                                    onClick={() => handleDeleteService(service.id)}
                          >
                                    Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Disponibilidade por Barbeiro */}
              <Card className="bg-barber-light border-[#333]">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <User className="mr-2 h-5 w-5 text-barber-gold" />
                    Disponibilidade por Barbeiro
                  </CardTitle>
                  <CardDescription>
                    Configure quais serviços cada barbeiro pode realizar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#333]">
                          <th className="text-left py-3 px-4">Serviço</th>
                          {barbers.map(barber => (
                            <th key={barber.id} className="text-center py-3 px-4">{barber.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {services.map(service => (
                          <tr key={service.id} className="border-b border-[#333] hover:bg-barber-dark/30">
                            <td className="py-3 px-4 font-medium">
                              {service.name}
                              <p className="text-xs text-barber-gray">{service.price}€ · {service.duration} min</p>
                            </td>
                            {barbers.map(barber => {
                              const isAvailable = (serviceBarberAvailability[service.id] || []).includes(barber.id);
                              return (
                                <td key={barber.id} className="text-center py-3 px-4">
                                  <div className="flex justify-center">
                                    <Switch 
                                      checked={isAvailable}
                                      onCheckedChange={() => toggleServiceAvailability(service.id, barber.id)}
                                    />
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              {/* Dialog para adicionar/editar serviço */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] bg-barber-light border-[#333]">
                  <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Editar Serviço' : 'Adicionar Serviço'}</DialogTitle>
                    <DialogDescription>
                      {isEditMode 
                        ? 'Atualize as informações do serviço abaixo.' 
                        : 'Preencha os detalhes do novo serviço.'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="service-name">Nome do Serviço *</Label>
                        <Input
                          id="service-name"
                          placeholder="Ex: Corte de Cabelo"
                          value={newService.name}
                          onChange={(e) => setNewService({...newService, name: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="service-price">Preço (€) *</Label>
                        <Input
                          id="service-price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="25.00"
                          value={newService.price}
                          onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value) || 0})}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="service-duration">Duração (minutos) *</Label>
                        <Input
                          id="service-duration"
                          type="number"
                          min="5"
                          step="5"
                          placeholder="30"
                          value={newService.duration}
                          onChange={(e) => setNewService({...newService, duration: parseInt(e.target.value) || 0})}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label htmlFor="service-description">Descrição</Label>
                        <Textarea
                          id="service-description"
                          placeholder="Descreva o serviço em detalhes..."
                          value={newService.description}
                          onChange={(e) => setNewService({...newService, description: e.target.value})}
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="col-span-2 flex items-center space-x-2">
                        <Switch
                          id="service-combo"
                          checked={newService.isCombo}
                          onCheckedChange={(checked) => setNewService({...newService, isCombo: checked})}
                        />
                        <Label htmlFor="service-combo">É um combo/pacote de serviços</Label>
                      </div>
                      
                      {newService.isCombo && (
                        <div className="col-span-2">
                          <Label>Serviços Incluídos</Label>
                          <div className="mt-1 grid grid-cols-2 gap-2">
                            {services.filter(s => !s.isCombo).map(service => (
                              <div key={service.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`included-${service.id}`}
                                  checked={(newService.includedServices || []).includes(service.id)}
                                  onChange={(e) => {
                                    const updated = e.target.checked
                                      ? [...(newService.includedServices || []), service.id]
                                      : (newService.includedServices || []).filter(id => id !== service.id);
                                    setNewService({...newService, includedServices: updated});
                                  }}
                                  className="h-4 w-4"
                                />
                                <Label htmlFor={`included-${service.id}`} className="text-sm">
                                  {service.name} ({service.price}€)
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="border-barber-gray text-barber-gray"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSaveService}
                      className="bg-barber-gold hover:bg-barber-gold/90 text-black"
                    >
                      {isEditMode ? 'Atualizar' : 'Adicionar'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeSection === 'settings' && userRole === 'admin' && (
            <div>
              <h1 className="text-3xl font-bold mb-8">Configurações Gerais</h1>
              
              <Tabs defaultValue="working-hours" className="w-full">
                <TabsList className="grid grid-cols-4 mb-6"> {/* Updated grid-cols-3 to grid-cols-4 */}
                  <TabsTrigger value="working-hours">Horário de Funcionamento</TabsTrigger>
                  <TabsTrigger value="holidays">Feriados e Datas Especiais</TabsTrigger>
                  <TabsTrigger value="messages">Mensagens Automáticas</TabsTrigger>
                  <TabsTrigger value="barber-hours">Horário dos Barbeiros</TabsTrigger> {/* New Trigger */}
                </TabsList>
                
                <TabsContent value="working-hours" className="bg-barber-light rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Horário de Funcionamento</h2>
                  <p className="mb-6 text-barber-gray">Defina os horários de funcionamento de sua barbearia para cada dia da semana.</p>
                  
                  <div className="space-y-4">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                      const dayNames: Record<string, string> = {
                        monday: 'Segunda-feira',
                        tuesday: 'Terça-feira',
                        wednesday: 'Quarta-feira',
                        thursday: 'Quinta-feira',
                        friday: 'Sexta-feira',
                        saturday: 'Sábado',
                        sunday: 'Domingo'
                      };
                      
                      return (
                        <div key={day} className="grid grid-cols-12 items-center gap-4 p-3 bg-barber-dark/30 rounded-lg">
                          <div className="col-span-3">
                            <Label className="font-medium">{dayNames[day]}</Label>
                          </div>
                          <div className="col-span-1 flex items-center justify-center">
                            <Switch 
                              checked={workingHours[day as keyof typeof workingHours].isOpen} 
                              onCheckedChange={(checked) => handleWorkingHoursChange(day as keyof typeof workingHours, 'isOpen', checked)}
                            />
                          </div>
                          <div className="col-span-8 grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`${day}-open`}>Abre às</Label>
                              <Input
                                id={`${day}-open`}
                                type="time"
                                value={workingHours[day as keyof typeof workingHours].open}
                                onChange={(e) => handleWorkingHoursChange(day as keyof typeof workingHours, 'open', e.target.value)}
                                disabled={!workingHours[day as keyof typeof workingHours].isOpen}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`${day}-close`}>Fecha às</Label>
                              <Input
                                id={`${day}-close`}
                                type="time"
                                value={workingHours[day as keyof typeof workingHours].close}
                                onChange={(e) => handleWorkingHoursChange(day as keyof typeof workingHours, 'close', e.target.value)}
                                disabled={!workingHours[day as keyof typeof workingHours].isOpen}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button 
                      onClick={saveSettings} 
                      disabled={savingSettings}
                      className="bg-barber-gold hover:bg-barber-gold/90 text-black"
                    >
                      {savingSettings ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="holidays" className="bg-barber-light rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Feriados e Datas Especiais</h2>
                  <p className="mb-6 text-barber-gray">Adicione feriados e datas em que a barbearia estará fechada ou terá horário especial.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Adicionar Nova Data</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="holiday-name">Nome do Feriado/Evento</Label>
                          <Input
                            id="holiday-name"
                            placeholder="Ex: Natal, Dia do Trabalhador, etc."
                            value={holidayName}
                            onChange={(e) => setHolidayName(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label>Data</Label>
                          <div className="mt-1">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {selectedHolidayDate ? format(selectedHolidayDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={selectedHolidayDate}
                                  onSelect={setSelectedHolidayDate} // Usar o state correto
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={addHoliday}
                          className="bg-barber-gold hover:bg-barber-gold/90 text-black w-full"
                        >
                          Adicionar Data
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Datas Cadastradas</h3>
                      {holidaysList.length === 0 ? (
                        <p className="text-barber-gray italic">Nenhuma data especial cadastrada.</p>
                      ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                          {holidaysList.map((holiday, index) => (
                            <div key={holiday.id || index} className="flex justify-between items-center p-3 bg-barber-dark/30 rounded-lg">
                              <div>
                                <p className="font-medium">{holiday.description}</p> {/* Usar description */}
                                <p className="text-sm text-barber-gray">
                                  {format(parseISO(holiday.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} {/* Formatar data string */}
                                </p>
              </div>
                              <Button size="sm" variant="outline" className="text-red-500 border-red-500 hover:bg-red-500/10" onClick={() => removeHoliday(index)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button 
                      onClick={saveSettings} 
                      disabled={savingSettings}
                      className="bg-barber-gold hover:bg-barber-gold/90 text-black"
                    >
                      {savingSettings ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="messages" className="bg-barber-light rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Mensagens Automáticas</h2>
                  <p className="mb-6 text-barber-gray">
                    Personalize as mensagens automáticas enviadas aos clientes. Utilize as variáveis entre chaves para 
                    incluir informações dinâmicas.
                  </p>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="booking-confirmation">Confirmação de Agendamento</Label>
                      <p className="text-xs text-barber-gray mb-2">
                        Variáveis disponíveis: {'{{'}<span>nome</span>{'}}'}, {'{{'}<span>data</span>{'}}'}, {'{{'}<span>hora</span>{'}}'}, {'{{'}<span>servico</span>{'}}'}, {'{{'}<span>barbeiro</span>{'}}'}
                      </p>
                      <Textarea
                        id="booking-confirmation"
                        value={automatedMessages.bookingConfirmation}
                        onChange={(e) => setAutomatedMessages({...automatedMessages, bookingConfirmation: e.target.value})}
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="reminder-message">Lembrete de Agendamento</Label>
                      <p className="text-xs text-barber-gray mb-2">
                        Variáveis disponíveis: {'{{'}<span>nome</span>{'}}'}, {'{{'}<span>data</span>{'}}'}, {'{{'}<span>hora</span>{'}}'}, {'{{'}<span>servico</span>{'}}'}, {'{{'}<span>barbeiro</span>{'}}'}
                      </p>
                      <Textarea
                        id="reminder-message"
                        value={automatedMessages.reminderMessage}
                        onChange={(e) => setAutomatedMessages({...automatedMessages, reminderMessage: e.target.value})}
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cancellation-message">Mensagem de Cancelamento</Label>
                      <p className="text-xs text-barber-gray mb-2">
                        Variáveis disponíveis: {'{{'}<span>nome</span>{'}}'}, {'{{'}<span>data</span>{'}}'}, {'{{'}<span>hora</span>{'}}'}, {'{{'}<span>servico</span>{'}}'}, {'{{'}<span>barbeiro</span>{'}}'}
                      </p>
                      <Textarea
                        id="cancellation-message"
                        value={automatedMessages.cancellationMessage}
                        onChange={(e) => setAutomatedMessages({...automatedMessages, cancellationMessage: e.target.value})}
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button 
                      onClick={saveSettings} 
                      disabled={savingSettings}
                      className="bg-barber-gold hover:bg-barber-gold/90 text-black"
                    >
                      {savingSettings ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </TabsContent>

                {/* New Content for Barber Hours */}
                <TabsContent value="barber-hours" className="bg-barber-light rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Horário de Trabalho dos Barbeiros</h2>
                  <p className="mb-6 text-barber-gray">Configure os horários de trabalho individuais para cada barbeiro, respeitando o horário de funcionamento geral.</p>
                  
                  {/* Barber Selector Dropdown */}
                  <div className="mb-6">
                    <Label htmlFor="barber-select-hours">Selecionar Barbeiro</Label>
                    <Select 
                      value={selectedBarberForHours || 'placeholder'} // Updated to use 'placeholder' instead of empty string
                      onValueChange={(value) => {
                        if (value && value !== 'placeholder') { // Check if a valid barber is selected
                           setSelectedBarberForHours(value);
                           fetchBarberHours(value);
                        } else {
                           setSelectedBarberForHours(null); // Handle deselection
                           setBarberWorkingHours([]); // Clear hours
                        }
                      }}
                    >
                      <SelectTrigger id="barber-select-hours" className="w-full md:w-1/2 mt-1">
                        <SelectValue placeholder="Escolha um barbeiro..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder">Escolha um barbeiro...</SelectItem> {/* Changed from empty string */}
                        {barbers.map(barber => (
                          <SelectItem key={barber.id} value={barber.id}>
                            {barber.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Barber Hours Configuration Area */}
                  {selectedBarberForHours ? (
                    <div>
                      {(loadingBarberHours /* || businessHoursLoading */) ? ( // Consider loading businessHours too
                        <div className="text-center py-6">
                           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-barber-gold mx-auto"></div>
                           <p className="mt-2 text-barber-gray">Carregando horários...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {[1, 2, 3, 4, 5, 6, 7].map(dayOfWeek => {
                            // --- Robust Checks ---
                            const dayKey = dayOfWeekToStringKey[dayOfWeek];
                            // Check if workingHours and the specific key exist BEFORE accessing
                            if (!workingHours || !workingHours[dayKey]) {
                              console.warn(`[BarberHours] Working hours not found for dayKey: ${dayKey}`);
                              return (
                                <div key={dayOfWeek} className="grid grid-cols-12 items-center gap-4 p-3 bg-barber-dark/50 rounded-lg text-red-500 opacity-70">
                                   <div className="col-span-3">{getDayName(dayOfWeek)}</div>
                                   <div className="col-span-9 text-xs">Erro: Horário func. não carregado.</div>
                                </div>
                              );
                            }
                            // --- End Checks ---

                            const barberDayHours = barberWorkingHours.find(h => h.day_of_week === dayOfWeek);
                            const dayName = getDayName(dayOfWeek);

                            const businessDayHours = workingHours[dayKey]; // Now safe to access
                            const isShopOpen = businessDayHours.isOpen;
                            const shopStartTime = businessDayHours.open;
                            const shopEndTime = businessDayHours.close;

                            const barberStartTime = barberDayHours?.start_time || '';
                            const barberEndTime = barberDayHours?.end_time || '';

                            const allTimeSlots = timeSlots;

                            let startTimeOptions: string[] = [];
                            let endTimeOptions: string[] = [];

                            try {
                                startTimeOptions = isShopOpen
                                  ? allTimeSlots.filter(slot => slot >= shopStartTime && slot < shopEndTime) // Start time must be before shop closes
                                  : [];

                                endTimeOptions = isShopOpen && barberStartTime
                                  ? allTimeSlots.filter(slot => slot > barberStartTime && slot <= shopEndTime) // End time can be exactly when shop closes
                                  : [];
                            } catch (filterError) {
                                 console.error("[BarberHours] ERROR filtering time slots for day", dayOfWeek, ":", filterError);
                            }

                            return (
                              <div key={dayOfWeek} className="grid grid-cols-12 items-center gap-4 p-3 bg-barber-dark/30 rounded-lg">
                                 <div className="col-span-3">
                                    <Label className={`font-medium ${!isShopOpen ? 'text-barber-gray opacity-50' : ''}`}>{dayName}</Label>
                                    {!isShopOpen && <span className="text-xs text-red-500 block">(Fechado)</span>}
                                 </div>
                                <div className="col-span-9 grid grid-cols-3 gap-4">
                                  {/* Start Time Select */}
                                  <div>
                                    <Label htmlFor={`barber-${dayOfWeek}-start`}>Início</Label>
                                    <Select
                                      value={barberStartTime || 'none'} // Update to use 'none' placeholder
                                      onValueChange={(value) => {
                                         // Convert 'none' to empty string
                                         const actualValue = value === 'none' ? '' : value;
                                         
                                         // Pass empty string for end time if start time is cleared or new end time would be invalid
                                         const currentEndTime = barberDayHours?.end_time || '';
                                         const newEndTime = actualValue && currentEndTime > actualValue ? currentEndTime : ''; 
                                         handleUpdateBarberHour(dayOfWeek, actualValue, newEndTime);
                                      }}
                                      disabled={!isShopOpen}
                                    >
                                      <SelectTrigger id={`barber-${dayOfWeek}-start`} disabled={!isShopOpen}>
                                        <SelectValue placeholder="--:--" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">--:--</SelectItem> {/* Changed from empty string */}
                                        {startTimeOptions.map((time) => (
                                          <SelectItem key={`start-${dayOfWeek}-${time}`} value={time}>{time}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {/* End Time Select */}
                                  <div>
                                    <Label htmlFor={`barber-${dayOfWeek}-end`}>Fim</Label>
                                    <Select
                                      value={barberEndTime || 'none'} // Update to use 'none' placeholder
                                      onValueChange={(value) => {
                                         // Convert 'none' to empty string
                                         const actualValue = value === 'none' ? '' : value;
                                         handleUpdateBarberHour(dayOfWeek, barberStartTime, actualValue);
                                      }}
                                      disabled={!isShopOpen || !barberStartTime}
                                    >
                                      <SelectTrigger id={`barber-${dayOfWeek}-end`} disabled={!isShopOpen || !barberStartTime}>
                                        <SelectValue placeholder="--:--" />
                                      </SelectTrigger>
                                      <SelectContent>
                                         <SelectItem value="none">--:--</SelectItem> {/* Changed from empty string */}
                                        {endTimeOptions.map((time) => (
                                          <SelectItem key={`end-${dayOfWeek}-${time}`} value={time}>{time}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                   {/* Remove Button Column */}
                                   <div className="flex items-end pb-1">
                                     {(barberStartTime || barberEndTime) && (
                                         <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                                            onClick={() => handleUpdateBarberHour(dayOfWeek, '', '')} // Call update with empty strings to remove
                                            disabled={!isShopOpen} // Optional: disable remove if shop closed? Or allow?
                                            title="Remover horário para este dia"
                                         >
                                            <Trash2 className="h-4 w-4" />
                                         </Button>
                                     )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                       {/* Botão Horário Padrão */}
                       <div className="mt-6 flex justify-end">
                          <Button 
                             variant="outline"
                             className="border-barber-gold text-barber-gold hover:bg-barber-gold hover:text-black"
                             onClick={handleSetupDefaultHours}
                             disabled={!selectedBarberForHours || loadingBarberHours}
                           >
                              <Settings className="mr-2 h-4 w-4" /> 
                              Definir Horário Padrão
                           </Button>
                       </div>
                    </div>
                  ) : (
                    <div className="text-center text-barber-gray py-10 bg-barber-dark/20 rounded-lg">
                       <UserCog className="h-12 w-12 mx-auto mb-3 text-barber-gray/50" />
                       <p>Selecione um barbeiro acima para configurar o seu horário de trabalho individual.</p>
                    </div>
                  )}
                </TabsContent>

              </Tabs>
            </div>
          )}

          {/* Horarios Section */}
          {activeSection === 'horarios' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Horários dos Barbeiros</h1>
                {/* Week Navigation */}
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={handlePreviousWeek}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                  </Button>
                  <span className="font-medium text-lg">
                     Semana de {format(currentWeekStart, 'dd/MM')} a {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'dd/MM/yyyy')}
                  </span>
                  <Button variant="outline" onClick={handleNextWeek}>
                     Próxima <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
        </div>
      </div>

              {loading ? (
                  <p>Carregando barbeiros...</p>
              ) : barbers.length === 0 ? (
                  <p>Nenhum barbeiro encontrado.</p>
              ) : (
                <Tabs defaultValue={barbers[0]?.id} className="w-full">
                  <TabsList className="mb-4 bg-barber-dark">
                    {barbers.map((barber) => (
                      <TabsTrigger key={barber.id} value={barber.id} className="data-[state=active]:bg-barber-gold data-[state=active]:text-black">
                        {barber.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {barbers.map((barber) => (
                    <TabsContent key={barber.id} value={barber.id}>
                      <Card className="bg-barber-light border-[#333]">
                        <CardHeader>
                          <CardTitle>Horário Semanal - {barber.name}</CardTitle>
                           <CardDescription>
                              Visualização da semana de {format(currentWeekStart, 'dd/MM')} a {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'dd/MM/yyyy')}
                           </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-barber-dark/50 min-w-[800px]">
                              <thead>
                                <tr className="bg-barber-dark">
                                  <th className="border border-barber-dark/50 p-2 w-20">Hora</th>
                                  {eachDayOfInterval({ start: currentWeekStart, end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }) }).map(day => (
                                    <th key={day.toString()} className="border border-barber-dark/50 p-2 text-center">
                                      {format(day, 'EEE', { locale: pt })}<br/>{format(day, 'dd/MM')}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {timeSlots.map(slot => (
                                  <tr key={slot}>
                                    <td className="border border-barber-dark/50 p-2 text-center font-medium text-sm bg-barber-dark">{slot}</td>
                                    {eachDayOfInterval({ start: currentWeekStart, end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }) }).map(day => {
                                      // Find appointment for this barber, day, and slot (any status)
                                      const appointment = appointments.find(app => 
                                           app.barber_id === barber.id &&
                                           isSameDay(parseISO(app.appointment_date), day) &&
                                           format(parseISO(`${app.appointment_date}T${app.start_time}`), 'HH:mm') === slot
                                           // Removed status check here to find all
                                      );
                                      
                                      const serviceDetails = appointment 
                                          ? services.find(s => s.id === appointment.service_id) 
                                          : null;

                                      // Determine background color and render state based on status
                                      let bgColor = 'bg-barber-light'; // Default empty cell, removed hover for occupied slots
                                      let textColor = 'text-black';
                                      let cellClassName = 'border border-barber-dark/50 p-1 text-xs h-12 align-top bg-barber-light hover:bg-barber-dark/20'; // Default empty cell style
                                      let shouldRenderBlock = false;

                                      if (appointment) {
                                        if (appointment.status === 'scheduled') {
                                          bgColor = 'bg-barber-gold';
                                          textColor = 'text-black';
                                          shouldRenderBlock = true;
                                          cellClassName = `border border-barber-dark/50 p-1 text-xs h-12 align-top ${bgColor}/80`; // Apply slight transparency to cell BG
                                        } else if (appointment.status === 'completed') {
                                          bgColor = 'bg-green-600'; // Green for completed
                                          textColor = 'text-white';
                                          shouldRenderBlock = true;
                                          cellClassName = `border border-barber-dark/50 p-1 text-xs h-12 align-top ${bgColor}/80`; // Apply slight transparency to cell BG
                                        } else if (appointment.status === 'no-show') { // Add specific case for no-show
                                          bgColor = 'bg-orange-600'; // Orange for no-show
                                          textColor = 'text-white';
                                          shouldRenderBlock = true; // Still render the block
                                          cellClassName = `border border-barber-dark/50 p-1 text-xs h-12 align-top ${bgColor}/80`;
                                        } else if (appointment.status === 'cancelled') {
                                          // Keep cancelled hidden
                                          shouldRenderBlock = false;
                                          cellClassName = 'border border-barber-dark/50 p-1 text-xs h-12 align-top bg-barber-light hover:bg-barber-dark/20'; // Reset to default empty cell
                                        } else {
                                           // Default case (shouldn't happen)
                                           shouldRenderBlock = false; 
                                           cellClassName = 'border border-barber-dark/50 p-1 text-xs h-12 align-top bg-barber-light hover:bg-barber-dark/20';
                                        }
                                      }

                                      return (
                                        <td 
                                          key={day.toString() + slot} 
                                          className={`${cellClassName} cursor-pointer`} // Add cursor-pointer 
                                          onClick={() => appointment && shouldRenderBlock && handleScheduleBlockClick(appointment)} // Add onClick conditionally
                                        >
                                          {/* Render block only if scheduled or completed */}
                                          {appointment && shouldRenderBlock && (
                                            // The div itself doesn't need to be clickable now, the TD handles it
                                            <div className={`${bgColor} ${textColor} p-1 rounded h-full overflow-hidden flex flex-col justify-between text-[10px] leading-tight shadow-sm`}>
                                                <div>
                                                    <p className="font-bold truncate">{appointment.client_name}</p>
                                                    <p className="truncate italic">
                                                      {serviceDetails?.name || 'Serviço Inválido'}
                                                    </p>
                                                </div>
                                                <p className="text-right font-mono"> 
                                                    {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                                                </p>
                                            </div>
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>
          )}

          {/* Reports Section */}
          {activeSection === 'reports' && (
            <Card className="bg-barber-dark border-barber-gold text-white">
              <CardHeader>
                <CardTitle>Gerar Relatório</CardTitle>
                <CardDescription>Selecione o período e gere um relatório financeiro e operacional.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Range Selection */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="report-start-date">Data de Início</Label>
                     <Popover>
                       <PopoverTrigger asChild>
                         <Button
                           id="report-start-date"
                           variant={"outline"}
                           className={`w-full justify-start text-left font-normal ${!reportStartDate && "text-muted-foreground"} bg-barber-light text-white border-barber-gray`}
                         >
                           <CalendarDays className="mr-2 h-4 w-4" />
                           {reportStartDate ? format(reportStartDate, "PPP", { locale: ptBR }) : <span>Selecione a data inicial</span>}
                         </Button>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0 bg-barber-light border-barber-gray" align="start">
                         <CalendarComponent
                           mode="single"
                           selected={reportStartDate}
                           onSelect={setReportStartDate}
                           initialFocus
                           className="text-white"
                         />
                       </PopoverContent>
                     </Popover>
                  </div>
                  <div className="flex-1">
                     <Label htmlFor="report-end-date">Data de Fim</Label>
                     <Popover>
                       <PopoverTrigger asChild>
                         <Button
                            id="report-end-date"
                            variant={"outline"}
                            className={`w-full justify-start text-left font-normal ${!reportEndDate && "text-muted-foreground"} bg-barber-light text-white border-barber-gray`}
                         >
                           <CalendarDays className="mr-2 h-4 w-4" />
                           {reportEndDate ? format(reportEndDate, "PPP", { locale: ptBR }) : <span>Selecione a data final</span>}
                         </Button>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0 bg-barber-light border-barber-gray" align="start">
                         <CalendarComponent
                           mode="single"
                           selected={reportEndDate}
                           onSelect={setReportEndDate}
                           disabled={(date) => reportStartDate && date < reportStartDate} // Disable dates before start date
                           initialFocus
                           className="text-white"
                         />
                       </PopoverContent>
                     </Popover>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button 
                     onClick={generateReport} 
                     disabled={isGeneratingReport || !reportStartDate || !reportEndDate}
                     className="bg-barber-gold hover:bg-barber-gold/90 text-black"
                  >
                     {isGeneratingReport ? 'Gerando...' : 'Gerar Relatório'}
                  </Button>
                   <Button 
                      onClick={exportReportToCSV} 
                      disabled={!reportData || isGeneratingReport} 
                      variant="outline" 
                      className="border-barber-gold text-barber-gold hover:bg-barber-gold hover:text-black"
                   >
                     Exportar para CSV
                   </Button>
                </div>

                {/* Report Display Area */}
                {isGeneratingReport && <p>Gerando relatório...</p>}
                {reportData && (
                  <div className="space-y-6 pt-4 border-t border-barber-gray/50">
                    <h3 className="text-xl font-semibold">Resultados do Relatório ({format(parseISO(reportData.startDate), 'dd/MM/yy')} - {format(parseISO(reportData.endDate), 'dd/MM/yy')})</h3>
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <Card className="bg-barber-light border-barber-gray">
                          <CardHeader><CardTitle>Faturamento Total</CardTitle></CardHeader>
                          <CardContent className="text-2xl font-bold text-green-400">€ {reportData.totalRevenue.toFixed(2)}</CardContent>
                       </Card>
                       <Card className="bg-barber-light border-barber-gray">
                          <CardHeader><CardTitle>Agend. Cancelados</CardTitle></CardHeader>
                          <CardContent className="text-2xl font-bold text-red-400">{reportData.cancelledCount}</CardContent>
                       </Card>
                    </div>

                    {/* Revenue per Barber Table */}
                    <div>
                       <h4 className="text-lg font-semibold mb-2">Faturamento por Barbeiro</h4>
                       <Table className="bg-barber-light border border-barber-gray">
                          <TableHeader>
                             <TableRow className="hover:bg-barber-dark border-b border-barber-gray">
                                <TableHead className="text-white">Barbeiro</TableHead>
                                <TableHead className="text-white text-right">Faturamento (€)</TableHead>
                             </TableRow>
                          </TableHeader>
                          <TableBody>
                             {Object.values(reportData.revenuePerBarber).sort((a, b) => b.revenue - a.revenue).map(barber => (
                                <TableRow key={barber.name} className="border-b border-barber-gray/50 hover:bg-barber-dark/30">
                                   <TableCell>{barber.name}</TableCell>
                                   <TableCell className="text-right font-medium">{barber.revenue.toFixed(2)}</TableCell>
                                </TableRow>
                             ))}
                          </TableBody>
                       </Table>
                    </div>

                     {/* Performance per Service Table */}
                     <div>
                       <h4 className="text-lg font-semibold mb-2">Desempenho por Serviço (Concluídos)</h4>
                       <Table className="bg-barber-light border border-barber-gray">
                          <TableHeader>
                             <TableRow className="hover:bg-barber-dark border-b border-barber-gray">
                                <TableHead className="text-white">Serviço</TableHead>
                                <TableHead className="text-white text-center">Quantidade</TableHead>
                                <TableHead className="text-white text-right">Faturamento (€)</TableHead>
                             </TableRow>
                          </TableHeader>
                          <TableBody>
                             {Object.values(reportData.revenuePerService).filter(s => s.count > 0 || s.revenue > 0).sort((a, b) => b.revenue - a.revenue).map(service => (
                                <TableRow key={service.name} className="border-b border-barber-gray/50 hover:bg-barber-dark/30">
                                   <TableCell>{service.name}</TableCell>
                                   <TableCell className="text-center">{service.count}</TableCell>
                                   <TableCell className="text-right font-medium">{service.revenue.toFixed(2)}</TableCell>
                                </TableRow>
                             ))}
                             {Object.values(reportData.revenuePerService).filter(s => s.count === 0 && s.revenue === 0).length > 0 && (
                                 <TableRow className="border-b border-barber-gray/50">
                                     <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">Serviços sem agendamentos concluídos no período não mostrados</TableCell>
                                 </TableRow>
                             )}
                          </TableBody>
                       </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Clients Section */}
          {activeSection === 'clients' && (
             <Card className="bg-barber-dark border-barber-gold text-white">
                 <CardHeader>
                     <CardTitle>Gestão de Clientes</CardTitle>
                     <CardDescription>Informações sobre os clientes da barbearia.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-6">
                    {isLoadingClientStats && <p>Carregando estatísticas dos clientes...</p>}
                    {!isLoadingClientStats && clientStats && (
                       <div className="space-y-6">
                          {/* Summary Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <Card className="bg-barber-light border-barber-gray">
                                <CardHeader><CardTitle>Total Clientes Ativos</CardTitle><CardDescription>(Com agend. concluídos)</CardDescription></CardHeader>
                                <CardContent className="text-3xl font-bold text-barber-gold">{clientStats.totalActiveClients}</CardContent>
                             </Card>
                             {/* Placeholder for other stats like New Clients, Avg Spend etc. */}
                          </div>

                          {/* Top Clients Table */}
                           <Card className="bg-barber-light border-barber-gray">
                              <CardHeader>
                                 <CardTitle>Top 10 Clientes Mais Assíduos</CardTitle>
                                 <CardDescription>Clientes com maior número de agendamentos concluídos.</CardDescription>
                              </CardHeader>
                              <CardContent>
                                  {clientStats.topClients.length > 0 ? (
                                     <Table>
                                        <TableHeader>
                                           <TableRow className="hover:bg-barber-dark border-b border-barber-gray">
                                              <TableHead className="text-white">Nome</TableHead>
                                              <TableHead className="text-white">Telefone</TableHead>
                                              <TableHead className="text-white text-center">Visitas</TableHead>
                                           </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                           {clientStats.topClients.map((client, index) => (
                                              <TableRow key={`${client.phone}-${client.name}-${index}`} className="border-b border-barber-gray/50 hover:bg-barber-dark/30">
                                                 <TableCell className="font-medium">{client.name}</TableCell>
                                                 <TableCell>{client.phone || 'N/A'}</TableCell>
                                                 <TableCell className="text-center font-bold">{client.visits}</TableCell>
                                              </TableRow>
                                           ))}
                                        </TableBody>
                                     </Table>
                                  ) : (
                                     <p className="text-center text-barber-gray py-4">Nenhum agendamento concluído encontrado para gerar ranking.</p>
                                  )}
                              </CardContent>
                           </Card>
                           
                           {/* Placeholder for Full Client List / Search */}
                           {/* 
                           <Card className="bg-barber-light border-barber-gray">
                              <CardHeader><CardTitle>Lista Completa de Clientes</CardTitle></CardHeader>
                              <CardContent>
                                 <p>Implementação futura...</p>
                              </CardContent>
                           </Card>
                           */}
                       </div>
                    )}
                    {!isLoadingClientStats && !clientStats && (
                         <p className="text-center text-barber-gray py-4">Não foi possível carregar as estatísticas dos clientes.</p>
                    )}
                 </CardContent>
             </Card>
         )}

          {/* Barbers Section - UPDATED TO SHOW IMAGE */}
          {activeSection === 'barbers' && userRole === 'admin' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gerenciar Barbeiros</h1>
                <Button onClick={() => setIsBarberDialogOpen(true)} className="bg-barber-gold hover:bg-barber-gold/90 text-black">
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Barbeiro
                </Button>
              </div>
              
              <div className="bg-barber-light rounded-lg p-6">
                {loading ? (
                  <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-barber-gold mx-auto"></div>
                    <p className="mt-4 text-barber-gray">Carregando barbeiros...</p>
                  </div>
                ) : barbers.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-lg text-barber-gray">Nenhum barbeiro cadastrado ainda.</p>
                    <Button onClick={() => setIsBarberDialogOpen(true)} className="mt-4 bg-barber-gold hover:bg-barber-gold/90 text-black">
                      <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Barbeiro
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {barbers.map(barber => (
                      <div key={barber.id} className="bg-barber-dark/30 p-6 rounded-lg border border-[#333] transition-shadow hover:shadow-lg">
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-24 mb-4 relative">
                            <img 
                              src={barber.profile_image_url || 'https://via.placeholder.com/96?text=Foto'} 
                              alt={barber.name}
                              className="w-full h-full object-cover rounded-full border-2 border-barber-gold" 
                            />
                          </div>
                          <h3 className="text-xl font-semibold">{barber.name}</h3>
                          <p className="text-barber-gold text-sm">{barber.email}</p>
                          {barber.phone && <p className="text-barber-gray text-sm mt-1">{barber.phone}</p>}
                          
                          <div className="mt-4 flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-barber-gold text-barber-gold hover:bg-barber-gold hover:text-black"
                              onClick={() => handleEditBarber(barber)}
                            >
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              onClick={() => handleDeleteConfirm(barber.id)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Diálogo de configuração do banco de dados */}
      <AlertDialog open={showDbSetupDialog} onOpenChange={setShowDbSetupDialog}>
        <AlertDialogContent className="bg-barber-light border-barber-gold">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl flex items-center">
              <Database className="mr-2 h-5 w-5 text-barber-gold" />
              Configuração do Banco de Dados Necessária
            </AlertDialogTitle>
            <AlertDialogDescription className="text-barber-gray">
              <p className="mb-4">
                Para que os serviços e a disponibilidade por barbeiro funcionem corretamente, 
                é necessário executar um script SQL para configurar as tabelas no banco de dados.
              </p>
              <div className="bg-[#1c1c1c] p-4 rounded my-4 text-barber-gold">
                <p className="text-sm mb-2">Execute este script no painel SQL do Supabase:</p>
                <pre className="text-xs overflow-auto">
                  {`-- Tabela de serviços
CREATE TABLE IF NOT EXISTS public.services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    duration integer NOT NULL,
    is_combo boolean DEFAULT false,
    included_services uuid[] DEFAULT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de disponibilidade de serviços por barbeiro
CREATE TABLE IF NOT EXISTS public.service_barber_availability (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
    barber_id uuid REFERENCES public.barbers(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE (service_id, barber_id)
);`}
                </pre>
              </div>
              <p>
                Esta é uma configuração única. Após executar o script, recarregue esta página.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-barber-gold hover:bg-barber-gold/90 text-black">
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Event Details Modal - Now it can call requestStatusUpdate */}
       <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
         <DialogContent className="sm:max-w-[525px] bg-barber-light border-barber-gold">
           <DialogHeader>
             <DialogTitle>Detalhes do Agendamento</DialogTitle>
             {selectedEventDetails && (
                <DialogDescription>
                     {/* Format date/time from selectedEventDetails */}
                     Agendado para {selectedEventDetails.appointment_date ? format(parseISO(selectedEventDetails.appointment_date), 'PPP', { locale: ptBR }) : 'Data Inválida'} {' '}
                     das {selectedEventDetails.start_time ? formatTime(selectedEventDetails.start_time) : '--:--'} {' '}
                     às {selectedEventDetails.end_time ? formatTime(selectedEventDetails.end_time) : '--:--'}
                </DialogDescription>
             )}
           </DialogHeader>
           {selectedEventDetails && (
             <div className="py-4 space-y-3 text-sm">
               <p><strong>Cliente:</strong> {selectedEventDetails.client_name}</p>
               <p><strong>Telefone:</strong> {selectedEventDetails.client_phone || 'Não informado'}</p>
               <p><strong>Email:</strong> {selectedEventDetails.client_email || 'Não informado'}</p>
               {/* Find barber and service details based on IDs */}
               <p><strong>Barbeiro:</strong> {getBarberNameById(selectedEventDetails.barber_id)}</p>
               <p><strong>Serviço:</strong> {services.find(s => s.id === selectedEventDetails.service_id)?.name || 'N/A'} (<span className="text-barber-gold">{services.find(s => s.id === selectedEventDetails.service_id)?.price || '0'} €</span>)</p>
               <p><strong>Status Atual:</strong> {getStatusBadge(selectedEventDetails.status)}</p>
                {selectedEventDetails.notes && <p><strong>Notas:</strong> {selectedEventDetails.notes}</p>}
             </div>
           )}
           <DialogFooter className="sm:justify-between flex-wrap gap-2">
             <div className="flex flex-wrap gap-2">
                {/* Buttons to change status */} 
                {selectedEventDetails?.status === 'scheduled' && (
                   <>
                    <Button 
                       variant="outline"
                       className="text-xs border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
                       onClick={() => requestStatusUpdate(selectedEventDetails!.id, 'completed')} 
                       disabled={updatingAppointment === selectedEventDetails?.id}
                    >
                      <Check className="mr-2 h-4 w-4"/> {updatingAppointment === selectedEventDetails?.id ? 'Concluindo...' : 'Concluído'}
                    </Button>
                    <Button 
                       variant="outline"
                       className="text-xs border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                       onClick={() => requestStatusUpdate(selectedEventDetails!.id, 'no-show')} 
                       disabled={updatingAppointment === selectedEventDetails?.id}
                    >
                      <User className="mr-2 h-4 w-4"/> {updatingAppointment === selectedEventDetails?.id ? 'Marcando...' : 'Não Compareceu'}
                    </Button>
                    <Button 
                       variant="destructive"
                       className="text-xs"
                       onClick={() => requestStatusUpdate(selectedEventDetails!.id, 'cancelled')} 
                       disabled={updatingAppointment === selectedEventDetails?.id}
                    >
                      <X className="mr-2 h-4 w-4"/> {updatingAppointment === selectedEventDetails?.id ? 'Cancelando...' : 'Cancelar Agend.'}
                    </Button>
                   </>
                )}
                 {selectedEventDetails?.status === 'completed' && (
                   <p className="text-sm text-green-500">Agendamento já concluído.</p>
                 )}
                 {selectedEventDetails?.status === 'cancelled' && (
                   <p className="text-sm text-red-500">Agendamento já cancelado.</p>
                 )}
                 {selectedEventDetails?.status === 'no-show' && (
                   <p className="text-sm text-yellow-500">Agendamento marcado como não compareceu.</p>
                 )}
             </div>
              <Button type="button" variant="secondary" onClick={() => setIsEventModalOpen(false)}>Fechar</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>

        {/* Status Update Confirmation Dialog - Calls confirmStatusUpdate */}
        <AlertDialog open={isStatusConfirmOpen} onOpenChange={setIsStatusConfirmOpen}>
         <AlertDialogContent className="bg-barber-light border-barber-gold">
           <AlertDialogHeader>
             <AlertDialogTitle>Confirmar Alteração de Status?</AlertDialogTitle>
             <AlertDialogDescription>
                Tem certeza que deseja alterar o status deste agendamento para "{statusUpdateInfo?.status}"?
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel onClick={() => setStatusUpdateInfo(null)}>Cancelar</AlertDialogCancel>
             <AlertDialogAction onClick={confirmStatusUpdate} className="bg-barber-gold hover:bg-barber-gold/90 text-black">Confirmar</AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
        </AlertDialog>

        {/* Add Barber Dialog */}
        <Dialog open={isBarberDialogOpen} onOpenChange={setIsBarberDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-barber-light border-[#333]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Barbeiro</DialogTitle>
              <DialogDescription className="text-barber-gray">
                Preencha os detalhes do novo barbeiro.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddBarber}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input 
                    id="name" 
                    value={newBarber.name} 
                    onChange={(e) => setNewBarber({...newBarber, name: e.target.value})} 
                    className="col-span-3" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={newBarber.email} 
                    onChange={(e) => setNewBarber({...newBarber, email: e.target.value})} 
                    className="col-span-3" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Telefone
                  </Label>
                  <Input 
                    id="phone" 
                    value={newBarber.phone} 
                    onChange={(e) => setNewBarber({...newBarber, phone: e.target.value})} 
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="profile_image_url" className="text-right">
                    URL da Foto
                  </Label>
                  <Input 
                    id="profile_image_url" 
                    value={newBarber.profile_image_url} 
                    onChange={(e) => setNewBarber({...newBarber, profile_image_url: e.target.value})} 
                    placeholder="https://exemplo.com/foto.jpg" 
                    className="col-span-3" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsBarberDialogOpen(false)}
                  className="border-barber-gray text-barber-gray"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-barber-gold hover:bg-barber-gold/90 text-black"
                  disabled={addingBarber}
                >
                  {addingBarber ? 'Adicionando...' : 'Adicionar Barbeiro'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Barber Dialog */}
        <Dialog open={isEditBarberDialogOpen} onOpenChange={setIsEditBarberDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-barber-light border-[#333]">
            <DialogHeader>
              <DialogTitle>Editar Barbeiro</DialogTitle>
              <DialogDescription className="text-barber-gray">
                Altere os detalhes do barbeiro.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateBarber}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Nome
                  </Label>
                  <Input 
                    id="edit-name" 
                    value={editingBarber?.name || ''} 
                    onChange={(e) => setEditingBarber(prev => prev ? {...prev, name: e.target.value} : prev)} 
                    className="col-span-3" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">
                    Email
                  </Label>
                  <Input 
                    id="edit-email" 
                    type="email" 
                    value={editingBarber?.email || ''} 
                    onChange={(e) => setEditingBarber(prev => prev ? {...prev, email: e.target.value} : prev)} 
                    className="col-span-3" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phone" className="text-right">
                    Telefone
                  </Label>
                  <Input 
                    id="edit-phone" 
                    value={editingBarber?.phone || ''} 
                    onChange={(e) => setEditingBarber(prev => prev ? {...prev, phone: e.target.value} : prev)} 
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-profile_image_url" className="text-right">
                    URL Foto
                  </Label>
                  <Input 
                    id="edit-profile_image_url" 
                    value={editingBarber?.profile_image_url || ''} 
                    onChange={(e) => setEditingBarber(prev => prev ? {...prev, profile_image_url: e.target.value} : prev)} 
                    className="col-span-3" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditBarberDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={addingBarber}>
                  {addingBarber ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent className="bg-barber-light border-barber-gold">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este barbeiro? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingBarber(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteBarber} className="bg-red-500 hover:bg-red-600 text-white">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
};

export default AdminDashboardPage;
