import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Calendar, Clock, User, Phone, Scissors, X, LogOut, Trash2, Edit, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getUserAppointments, deleteAppointment, updateUserProfile } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Appointment {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  barbers: {
    id: string;
    name: string;
    email: string;
  };
  services: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
}

const UserDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'appointments' | 'profile'>('appointments');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('scheduled');

  useEffect(() => {
    if (user) {
      fetchAppointments();
      setProfileData({
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        phone: user.user_metadata?.phone || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      if (!user || !user.email) {
        throw new Error("Usuário não autenticado");
      }
      
      const { data, error } = await getUserAppointments(user.email);
      
      if (error) throw error;
      
      if (data) {
        // Ordenar as marcações por data (mais recentes primeiro)
        const sortedAppointments = data.sort((a, b) => {
          const dateA = new Date(`${a.appointment_date}T${a.start_time}`);
          const dateB = new Date(`${b.appointment_date}T${b.start_time}`);
          return dateB.getTime() - dateA.getTime();
        });
        
        setAppointments(sortedAppointments);
      }
    } catch (error: any) {
      console.error("Erro ao buscar marcações:", error);
      toast({
        title: "Erro ao Buscar Marcações",
        description: error.message || "Não foi possível obter suas marcações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      setCancelLoading(true);
      
      console.log("Tentando excluir a marcação:", selectedAppointment);
      const { error } = await deleteAppointment(selectedAppointment);
      
      if (error) throw error;
      
      toast({
        title: "Marcação Excluída",
        description: "A sua marcação foi excluída com sucesso.",
      });
      
      // Remover a marcação da lista local
      setAppointments(appointments.filter(appointment => appointment.id !== selectedAppointment));
      
    } catch (error: any) {
      console.error("Erro ao excluir marcação:", error);
      toast({
        title: "Erro ao Excluir Marcação",
        description: error.message || "Não foi possível excluir a sua marcação.",
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: pt });
  };

  const formatTime = (timeString: string) => {
    // Formato de entrada: "09:00:00" ou similar
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // Helper function to filter appointments based on status
  const filteredAppointments = appointments.filter(appointment => {
    if (filterStatus === 'all') return true;
    return appointment.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      scheduled: { 
        label: 'Agendado', 
        className: 'bg-green-900/30 text-green-400 border-green-400' 
      },
      completed: { 
        label: 'Concluído', 
        className: 'bg-blue-900/30 text-blue-400 border-blue-400' 
      },
      cancelled: { 
        label: 'Cancelado', 
        className: 'bg-red-900/30 text-red-400 border-red-400' 
      },
      'no-show': { 
        label: 'Não Compareceu', 
        className: 'bg-amber-900/30 text-amber-400 border-amber-400' 
      }
    };
    
    const statusInfo = statusMap[status] || { 
      label: 'Desconhecido', 
      className: 'bg-gray-900/30 text-gray-400 border-gray-400' 
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full border ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Implementar a atualização do perfil usando a função Supabase
      // Esta função precisará ser criada no arquivo supabase.ts
      const { error } = await updateUserProfile({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone
      });
      
      if (error) throw error;
      
      toast({
        title: "Perfil Atualizado",
        description: "As informações do seu perfil foram atualizadas com sucesso."
      });
      
      setEditingProfile(false);
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro ao Atualizar Perfil",
        description: error.message || "Não foi possível atualizar o seu perfil.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Se não tivermos usuário, não devemos estar aqui
  if (!user) {
    return null; // Essa verificação é redundante com nossa rota protegida, mas é uma segurança extra
  }

  const userEmail = user.email || '';
  const userName = user.user_metadata?.full_name || user.user_metadata?.first_name || userEmail;

  return (
    <div className="pt-32 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="glass-card rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold">Olá, {userName}!</h1>
              <p className="text-barber-gray mt-2">Bem-vindo ao seu dashboard pessoal.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button onClick={() => navigate('/booking')} className="bg-barber-gold hover:bg-barber-gold/90 text-black">
                Nova Marcação
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="glass-card rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Menu</h2>
              <ul className="space-y-2">
                <li className="py-2 border-b border-[#333]">
                  <button 
                    onClick={() => setActiveSection('appointments')}
                    className={`flex items-center w-full text-left ${activeSection === 'appointments' ? 'text-barber-gold' : 'text-barber-gray hover:text-white'} transition-colors`}
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    <span>Minhas Marcações</span>
                  </button>
                </li>
                <li className="py-2 border-b border-[#333]">
                  <button 
                    onClick={() => setActiveSection('profile')} 
                    className={`flex items-center w-full text-left ${activeSection === 'profile' ? 'text-barber-gold' : 'text-barber-gray hover:text-white'} transition-colors`}
                  >
                    <User className="mr-2 h-5 w-5" />
                    <span>Perfil</span>
                  </button>
                </li>
                <li className="py-2">
                  <button 
                    onClick={signOut}
                    className="flex items-center text-barber-gray hover:text-white transition-colors w-full text-left"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-3">
            {activeSection === 'appointments' && (
              <div className="glass-card rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Suas Marcações</h2>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Button 
                    variant={filterStatus === 'scheduled' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('scheduled')}
                    className={filterStatus === 'scheduled' ? 'bg-barber-gold text-black' : 'border-barber-gold text-barber-gold'}
                  >
                    Agendadas
                  </Button>
                  <Button 
                    variant={filterStatus === 'completed' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('completed')}
                    className={filterStatus === 'completed' ? 'bg-barber-gold text-black' : 'border-barber-gold text-barber-gold'}
                  >
                    Concluídas
                  </Button>
                  <Button 
                    variant={filterStatus === 'cancelled' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('cancelled')}
                    className={filterStatus === 'cancelled' ? 'bg-barber-gold text-black' : 'border-barber-gold text-barber-gold'}
                  >
                    Canceladas
                  </Button>
                   <Button 
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('all')}
                    className={filterStatus === 'all' ? 'bg-barber-gold text-black' : 'border-barber-gold text-barber-gold'}
                  >
                    Todas
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-barber-gold mx-auto"></div>
                    <p className="mt-3 text-barber-gray">Carregando suas marcações...</p>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-10">
                    <Calendar className="h-12 w-12 text-barber-gray mx-auto" />
                    <h3 className="mt-4 text-xl font-bold">Nenhuma Marcação Encontrada</h3>
                    <p className="mt-2 text-barber-gray">
                      Você não tem marcações {filterStatus !== 'all' ? `com o status "${filterStatus}"` : ''}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredAppointments.map(appointment => (
                      <div key={appointment.id} className="bg-barber-dark/30 p-4 rounded-lg border border-[#333] transition-shadow hover:shadow-lg">
                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-3">
                          <div>
                            <span className="text-lg font-semibold">{appointment.services.name}</span>
                            <p className="text-sm text-barber-gold">{appointment.barbers.name}</p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-barber-gray" />
                            <span>{formatDate(appointment.appointment_date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-barber-gray" />
                            <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-barber-gold font-medium">{appointment.services.price} €</span>
                          </div>
                        </div>
                        
                        {/* Show Cancel Button only for 'scheduled' appointments */}
                        {appointment.status === 'scheduled' && (
                          <div className="flex justify-end mt-3">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedAppointment(appointment.id);
                                setCancelDialogOpen(true);
                              }}
                              disabled={cancelLoading && selectedAppointment === appointment.id}
                            >
                              {cancelLoading && selectedAppointment === appointment.id ? (
                                'Cancelando...'
                              ) : (
                                <Trash2 className="h-4 w-4 mr-1" /> 
                              )}
                              Cancelar Marcação
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeSection === 'profile' && (
              <div className="glass-card rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Meu Perfil</h2>
                  {!editingProfile ? (
                    <Button 
                      variant="outline" 
                      className="text-barber-gold border-barber-gold hover:bg-barber-gold/10"
                      onClick={() => setEditingProfile(true)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar Perfil
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="text-barber-gray border-barber-gray hover:bg-gray-800"
                      onClick={() => setEditingProfile(false)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-barber-gray mb-1">Nome</label>
                      {editingProfile ? (
                        <Input 
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          className="bg-[#222] border-[#333] focus:border-barber-gold"
                        />
                      ) : (
                        <p className="text-white py-2">{profileData.firstName || '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-barber-gray mb-1">Sobrenome</label>
                      {editingProfile ? (
                        <Input 
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          className="bg-[#222] border-[#333] focus:border-barber-gold"
                        />
                      ) : (
                        <p className="text-white py-2">{profileData.lastName || '-'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-barber-gray mb-1">E-mail</label>
                    <p className="text-white py-2">{profileData.email}</p>
                    <p className="text-xs text-barber-gray mt-1">O email não pode ser alterado.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-barber-gray mb-1">Telefone</label>
                    {editingProfile ? (
                      <Input 
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="bg-[#222] border-[#333] focus:border-barber-gold"
                      />
                    ) : (
                      <p className="text-white py-2">{profileData.phone || '-'}</p>
                    )}
                  </div>
                  
                  {editingProfile && (
                    <div className="flex justify-end mt-6">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="bg-barber-gold hover:bg-barber-gold/90 text-black"
                      >
                        {saving ? 'Salvando...' : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar Alterações
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Dialog de confirmação para cancelamento */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atenção</AlertDialogTitle>
            <AlertDialogDescription className="py-4 text-center text-lg">
              Pretende mesmo apagar a sua marcação?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCancelAppointment}
              disabled={cancelLoading}
            >
              {cancelLoading ? 'Excluindo...' : 'Sim, Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserDashboard; 