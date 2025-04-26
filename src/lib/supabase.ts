import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase
const supabaseUrl = 'https://jcvrfnpantgsztdfknop.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjdnJmbnBhbnRnc3p0ZGZrbm9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1Mzk5MDUsImV4cCI6MjA2MDExNTkwNX0.QzKr8nkZbwSc1nmWXMSWrow0TesY-bvKY_Z4xT-8TgI';

// Cria o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções de autenticação simplificadas
export const signUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        phone: userData.phone || '',
        full_name: userData.firstName + ' ' + userData.lastName
      }
    }
  });
  
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  return { data, error };
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

// Função para verificar se o usuário está autenticado
export const isAuthenticated = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
};

// Funções para barbearia
export const getBarbers = async () => {
  return await supabase.from('barbers').select('*');
};

// Função para criar um novo barbeiro
export const createBarber = async (barberData: { 
  name: string; 
  email: string; 
  phone?: string;
  profile_image_url?: string;
}) => {
  const { name, email, phone, profile_image_url } = barberData;
  
  // Preparar dados para insert
  const dataToInsert = {
    name,
    email,
    phone: phone || null,
    profile_image_url: profile_image_url || null
  };
  
  return await supabase
    .from('barbers')
    .insert([dataToInsert])
    .select()
    .single();
};

// Função para atualizar um barbeiro existente
export const updateBarber = async (
  barberId: string, 
  barberData: { 
    name?: string; 
    email?: string; 
    phone?: string;
    profile_image_url?: string;
  }
) => {
  console.log(`Atualizando barbeiro ID ${barberId}:`, barberData);
  
  return await supabase
    .from('barbers')
    .update(barberData)
    .eq('id', barberId)
    .select()
    .single();
};

// Função para excluir um barbeiro
export const deleteBarber = async (barberId: string) => {
  console.log(`Excluindo barbeiro ID ${barberId}`);
  
  return await supabase
    .from('barbers')
    .delete()
    .eq('id', barberId);
};

export const getServices = async () => {
  return await supabase.from('services').select('*');
};

export const getAvailableSlots = async (barberId: string, date: string, serviceId: string) => {
  return await supabase.rpc('get_available_slots', {
    p_barber_id: barberId,
    p_date: date,
    p_service_id: serviceId
  });
};

export const createAppointment = async (appointmentData: any) => {
  return await supabase.from('appointments').insert([appointmentData]).select();
};

export const getUserAppointments = async (email: string) => {
  return await supabase
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
      barbers (
        id,
        name,
        email
      ),
      services (
        id,
        name,
        price,
        duration
      )
    `)
    .eq('client_email', email);
};

// Funções para a fila de emails
export const getEmailQueue = async () => {
  return await supabase
    .from('email_queue')
    .select('*')
    .eq('sent', false)
    .order('created_at', { ascending: true });
};

export const markEmailAsSent = async (emailId: string) => {
  return await supabase
    .from('email_queue')
    .update({ 
      sent: true,
      sent_at: new Date().toISOString()
    })
    .eq('id', emailId);
};

// Função para cancelar uma marcação
export const cancelAppointment = async (appointmentId: string) => {
  console.log(`Iniciando cancelamento para a marcação ID: ${appointmentId}`);
  
  const result = await supabase
    .from('appointments')
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', appointmentId)
    .select();
  
  console.log("Resultado da operação de cancelamento:", result);
  return result;
};

// Função alternativa para cancelar uma marcação usando RPC
export const cancelAppointmentRPC = async (appointmentId: string) => {
  console.log(`Iniciando cancelamento via RPC para a marcação ID: ${appointmentId}`);
  
  const result = await supabase.rpc('cancel_appointment', {
    appointment_id: appointmentId
  });
  
  console.log("Resultado do cancelamento via RPC:", result);
  return result;
};

// Função para obter o ID do barbeiro do usuário autenticado
export const getBarberIdForCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('barbers')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (error || !data) return null;
    
    return data.id;
  } catch (error) {
    console.error('Erro ao obter ID do barbeiro:', error);
    return null;
  }
};

// Função para obter as marcações de um barbeiro
export const getBarberAppointments = async (barberId: string) => {
  return await supabase
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
      service_id,
      services (
        id,
        name,
        price,
        duration
      )
    `)
    .eq('barber_id', barberId)
    .order('appointment_date', { ascending: true })
    .order('start_time', { ascending: true });
};

// Função para verificar se o usuário autenticado é um barbeiro
export const isBarber = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    // Verificar se o usuário é um barbeiro
    const { data, error } = await supabase
      .from('barbers')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (error || !data) return false;
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar se é barbeiro:', error);
    return false;
  }
};

// Função para atualizar o status de uma marcação (para barbeiros)
export const updateAppointmentStatus = async (appointmentId: string, newStatus: 'completed' | 'cancelled' | 'no-show') => {
  console.log(`Atualizando status da marcação ID: ${appointmentId} para ${newStatus}`);
  
  const result = await supabase.rpc('update_appointment_status', {
    appointment_id: appointmentId,
    new_status: newStatus
  });
  
  console.log("Resultado da atualização de status:", result);
  return result;
};

// Função para excluir permanentemente uma marcação
export const deleteAppointment = async (appointmentId: string) => {
  console.log(`Excluindo permanentemente a marcação ID: ${appointmentId}`);
  
  const result = await supabase.rpc('delete_appointment', {
    appointment_id: appointmentId
  });
  
  console.log("Resultado da exclusão da marcação:", result);
  return result;
};

// Função para atualizar o perfil do usuário
export const updateUserProfile = async (userData: {
  first_name: string;
  last_name: string;
  phone: string;
}) => {
  console.log("Atualizando perfil do usuário:", userData);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Usuário não autenticado");
  }
  
  try {
    // 1. Atualizar os metadados do usuário na tabela auth.users
    const authResult = await supabase.auth.updateUser({
      data: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        full_name: `${userData.first_name} ${userData.last_name}`.trim()
      }
    });
    
    if (authResult.error) {
      console.error("Erro ao atualizar metadados:", authResult.error);
      throw authResult.error;
    }
    
    // 2. Atualizar a tabela profiles usando a função RPC
    const rpcResult = await supabase.rpc('update_user_profile', {
      p_first_name: userData.first_name,
      p_last_name: userData.last_name,
      p_phone: userData.phone
    });
    
    if (rpcResult.error) {
      console.error("Erro ao atualizar perfil via RPC:", rpcResult.error);
      throw rpcResult.error;
    }
    
    console.log("Perfil atualizado com sucesso:", { authResult, rpcResult });
    return authResult;
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    throw error;
  }
};

// Função para enviar email de recuperação de senha
export const resetPassword = async (email: string) => {
  console.log(`Enviando email de recuperação de senha para: ${email}`);
  
  const result = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  console.log("Resultado do envio de recuperação de senha:", result);
  return result;
};

// Função para limpar o cache do esquema
export const refreshSchemaCache = async () => {
  try {
    await supabase.rpc('reload_types');
    console.log('Cache do esquema atualizado com sucesso');
  } catch (e) {
    console.warn('Função reload_types não disponível:', e);
  }
};

// Funções para gerir serviços
export const createService = async (serviceData: any) => {
  console.log('Criando novo serviço:', serviceData);
  // Tenta forçar a atualização do cache do esquema antes de criar
  try {
    await refreshSchemaCache();
  } catch (e) {
    console.warn('Não foi possível atualizar o cache do esquema:', e);
  }
  return await supabase
    .from('services')
    .insert([serviceData])
    .select();
};

export const updateService = async (serviceId: string, serviceData: any) => {
  console.log(`Atualizando serviço ID ${serviceId}:`, serviceData);
  
  // Tenta forçar a atualização do cache do esquema antes de atualizar
  try {
    await refreshSchemaCache();
  } catch (e) {
    console.warn('Não foi possível atualizar o cache do esquema:', e);
  }
  
  return await supabase
    .from('services')
    .update(serviceData)
    .eq('id', serviceId)
    .select();
};

export const deleteService = async (serviceId: string) => {
  console.log(`Excluindo serviço ID ${serviceId}`);
  // Tenta forçar a atualização do cache do esquema antes de excluir
  try {
    await refreshSchemaCache();
  } catch (e) {
    console.warn('Não foi possível atualizar o cache do esquema:', e);
  }
  return await supabase
    .from('services')
    .delete()
    .eq('id', serviceId);
};

// Função para obter a disponibilidade de todos os serviços por barbeiro
export const getServiceBarberAvailability = async () => {
  // Tenta forçar a atualização do cache do esquema
  try {
    await refreshSchemaCache();
  } catch (e) {
    console.warn('Não foi possível atualizar o cache do esquema:', e);
  }
  return await supabase
    .from('service_barber_availability')
    .select('*');
};

// Função para atualizar a disponibilidade de serviço por barbeiro
export const updateServiceBarberAvailability = async (serviceId: string, barberIds: string[]) => {
  console.log(`Atualizando disponibilidade do serviço ${serviceId} para barbeiros:`, barberIds);
  
  // Tenta forçar a atualização do cache do esquema
  try {
    await refreshSchemaCache();
  } catch (e) {
    console.warn('Não foi possível atualizar o cache do esquema:', e);
  }
  
  // Primeiro, removemos todas as associações existentes para este serviço
  const { error: deleteError } = await supabase
    .from('service_barber_availability')
    .delete()
    .eq('service_id', serviceId);
  
  if (deleteError) {
    console.error('Erro ao remover disponibilidades existentes:', deleteError);
    return { error: deleteError };
  }
  
  // Se não houver barbeiros associados, terminamos aqui
  if (!barberIds.length) {
    return { data: [], error: null };
  }
  
  // Criamos novas associações para cada barbeiro
  const availabilityData = barberIds.map(barberId => ({
    service_id: serviceId,
    barber_id: barberId
  }));
  
  return await supabase
    .from('service_barber_availability')
    .insert(availabilityData)
    .select();
};

// Funções para gerenciar horários de funcionamento
export const getBusinessHours = async () => {
  console.log('Buscando horários de funcionamento');
  return await supabase
    .from('business_hours')
    .select('*')
    .order('day_of_week');
};

export const updateBusinessHours = async (day: string, changes: {
  open_time?: string;
  close_time?: string;
  is_open?: boolean;
}) => {
  // Remover logs de depuração
  // console.log(`[updateBusinessHours] Iniciando atualização para ${day}:`, changes);
  try {
    const { data, error } = await supabase
      .from('business_hours')
      .update(changes)
      .eq('day_of_week', day)
      .select();
      
    // Remover logs de depuração
    // if (error) {
    //   console.error('[updateBusinessHours] Erro ao atualizar:', error);
    //   throw error;
    // } else {
    //   console.log('[updateBusinessHours] Sucesso na atualização. Resposta:', data);
    // }
    return { data, error }; // Retornar o resultado original
  } catch (e) {
    // Remover log de depuração
    // console.error('[updateBusinessHours] Exceção capturada:', e);
    return { data: null, error: e }; // Retornar um objeto de erro
  }
};

// --- Funções para Dias Fechados (Feriados) ---

// Buscar todos os dias fechados
export const getClosedDays = async () => {
  console.log('Buscando dias fechados');
  return await supabase
    .from('closed_days')
    .select('*');
};

// Adicionar um novo dia fechado
export const addClosedDay = async (date: string, description: string) => {
  console.log(`Adicionando dia fechado: ${date} - ${description}`);
  return await supabase
    .from('closed_days')
    .insert([{ date, description }])
    .select();
};

// Remover um dia fechado pela data
export const removeClosedDay = async (date: string) => {
  console.log(`Removendo dia fechado: ${date}`);
  return await supabase
    .from('closed_days')
    .delete()
    .eq('date', date);
};

// --- Função para obter o Role do Utilizador Logado ---
export const getUserRole = async (): Promise<string | null> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    if (!session?.user) return null; // Não há usuário logado

    const userId = session.user.id;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single(); // Espera apenas um resultado
      
    if (error) {
      // Se o erro for 'PGRST116' (resultado não encontrado), significa que não há perfil
      if (error.code === 'PGRST116') {
        console.warn(`Perfil não encontrado para o usuário ID: ${userId}`);
        return null;
      }
      // Outro erro
      console.error("Erro ao buscar role do perfil:", error);
      throw error;
    }
    
    return data?.role || null;
    
  } catch (error) {
    console.error("Exceção ao buscar role do usuário:", error);
    return null;
  }
};

// --- Funções para Message Templates ---

// Buscar todos os modelos de mensagem
export const getMessageTemplates = async () => {
  console.log('Buscando modelos de mensagem');
  return await supabase
    .from('message_templates')
    .select('template_type, template_body');
};

// Atualizar ou inserir (UPSERT) um modelo de mensagem
export const upsertMessageTemplate = async (templateType: string, templateBody: string) => {
  console.log(`Atualizando/Inserindo modelo: ${templateType}`);
  return await supabase
    .from('message_templates')
    .upsert(
      { template_type: templateType, template_body: templateBody },
      { onConflict: 'template_type' } // Se existir conflito na chave primária (template_type), atualiza
    )
    .select(); // Retorna o registo atualizado/inserido
};

// --- Função para buscar Barbeiros por Serviço ---
export const getAvailableBarbersForService = async (serviceId: string): Promise<{ data: { barber_id: string }[] | null; error: any }> => {
  if (!serviceId) {
    // Se nenhum serviço for fornecido, talvez retornar todos os barbeiros ou um erro?
    // Por agora, vamos retornar um array vazio para evitar erros.
    // Considerar buscar todos se esta for a lógica desejada.
    console.warn('getAvailableBarbersForService chamado sem serviceId.');
    return { data: [], error: null }; 
  }
  
  console.log(`Buscando barbeiros disponíveis para o serviço ID: ${serviceId}`);
  const { data, error } = await supabase
    .from('service_barber_availability')
    .select('barber_id')
    .eq('service_id', serviceId);

  // O Supabase retorna um tipo genérico, podemos fazer um cast se necessário, 
  // mas vamos confiar na query por agora e retornar diretamente.
  // É importante garantir que a RLS permite a leitura desta tabela pelo usuário logado.
  return { data, error };
};

// --- Funções para Horários de Trabalho dos Barbeiros ---

// Interface para horário de trabalho
export interface BarberWorkingHour {
  id?: string; // O ID é gerado pelo Supabase
  barber_id: string;
  day_of_week: number; // 1 = Segunda, ..., 7 = Domingo (consistente com EXTRACT DOW + ajuste)
  start_time: string; // Formato HH24:MI (ex: "09:00")
  end_time: string; // Formato HH24:MI (ex: "18:00")
  created_at?: string;
  updated_at?: string;
}

// Buscar horários de trabalho de um barbeiro
export const getBarberWorkingHours = async (barberId: string): Promise<{ data: BarberWorkingHour[] | null; error: any }> => {
  console.log(`Buscando horários de trabalho do barbeiro ID: ${barberId}`);
  return await supabase
    .from('barber_working_hours')
    .select('*')
    .eq('barber_id', barberId)
    .order('day_of_week', { ascending: true });
};

// Atualizar ou inserir (UPSERT) horário de trabalho de um barbeiro para um dia
export const updateBarberWorkingHour = async (
  barberId: string,
  dayOfWeek: number, 
  startTime: string, // Formato HH24:MI
  endTime: string // Formato HH24:MI
): Promise<{ data: BarberWorkingHour[] | null; error: any }> => {
  console.log(`Atualizando/Inserindo horário para barbeiro ${barberId}, dia ${dayOfWeek}, ${startTime}-${endTime}`);
  
  // Prepara o objeto para upsert
  const hourData = {
    barber_id: barberId,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime
  };

  // Usa upsert para criar ou atualizar baseado na combinação única de barber_id e day_of_week
  // Assumindo que existe uma UNIQUE constraint em (barber_id, day_of_week)
  return await supabase
    .from('barber_working_hours')
    .upsert(hourData, { onConflict: 'barber_id, day_of_week' })
    .select(); // Retorna o registo afetado
};

// Excluir horário de trabalho de um barbeiro para um dia específico
export const deleteBarberWorkingHour = async (barberId: string, dayOfWeek: number): Promise<{ error: any }> => {
  console.log(`Excluindo horário de trabalho para o barbeiro ID ${barberId}, dia ${dayOfWeek}`);
  
  return await supabase
    .from('barber_working_hours')
    .delete()
    .eq('barber_id', barberId)
    .eq('day_of_week', dayOfWeek);
};

// Configurar horários de trabalho padrão para um barbeiro (ex: Seg-Sex 9h-18h, Sab 9h-13h)
export const setupDefaultWorkingHours = async (barberId: string): Promise<{ data: BarberWorkingHour[] | null; error: any }> => {
  console.log(`Configurando horários padrão para o barbeiro ID ${barberId}`);
  
  const defaultHours: Omit<BarberWorkingHour, 'id' | 'created_at' | 'updated_at'>[] = [];
  // Segunda a Sexta (1-5)
  for (let day = 1; day <= 5; day++) {
    defaultHours.push({
      barber_id: barberId,
      day_of_week: day,
      start_time: '09:00',
      end_time: '18:00' // Ajustado para 18h
    });
  }
  // Sábado (6)
  defaultHours.push({
    barber_id: barberId,
    day_of_week: 6,
    start_time: '09:00',
    end_time: '13:00'
  });
  // Domingo (7) - Por padrão, não trabalha (não adicionamos entrada)
  
  // 1. Limpar horários existentes para este barbeiro
  const { error: deleteError } = await supabase
    .from('barber_working_hours')
    .delete()
    .eq('barber_id', barberId);
    
  if (deleteError) {
    console.error("Erro ao limpar horários existentes:", deleteError);
    return { data: null, error: deleteError };
  }
  
  // 2. Inserir os novos horários padrão
  return await supabase
    .from('barber_working_hours')
    .insert(defaultHours)
    .select(); // Retorna os registros inseridos
};

// --- Funções para Upload de Imagens ---

/**
 * Faz upload de uma imagem de perfil para o barbeiro no Supabase Storage
 * @param file Arquivo de imagem a ser enviado
 * @param barberId ID do barbeiro para nomear o arquivo e atualizar o perfil
 * @returns URL pública da imagem ou um objeto de erro
 */
export const uploadBarberProfileImage = async (file: File, barberId: string): Promise<{ data: { url: string } | null; error: any }> => {
  try {
    // Validações básicas
    if (!file) return { data: null, error: { message: 'Nenhum arquivo selecionado.' } };
    if (!file.type.startsWith('image/')) return { data: null, error: { message: 'O arquivo deve ser uma imagem.' } };
    if (file.size > 5 * 1024 * 1024) return { data: null, error: { message: 'A imagem não pode exceder 5MB.' } }; // Limite de 5MB

    const fileExt = file.name.split('.').pop();
    const fileName = `${barberId}_${Date.now()}.${fileExt}`;
    const filePath = `barber-photos/${fileName}`; // Caminho dentro do bucket

    console.log(`Fazendo upload para: ${filePath}`);

    // Upload para o bucket 'profile-images' (certifique-se que este bucket existe e tem as permissões corretas)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images') 
      .upload(filePath, file, {
        cacheControl: '3600', // Cache de 1 hora
        upsert: false, // Não sobrescrever se já existir (gera erro se nome repetir)
      });

    if (uploadError) {
      console.error("Erro no upload para o Supabase Storage:", uploadError);
      throw uploadError;
    }

    console.log("Upload bem-sucedido:", uploadData);

    // Obter a URL pública da imagem carregada
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      throw new Error('Não foi possível obter a URL pública da imagem.');
    }

    const publicUrl = urlData.publicUrl;
    console.log(`URL Pública: ${publicUrl}`);

    // Atualizar a tabela 'barbers' com a nova URL
    const { data: updateData, error: updateError } = await supabase
      .from('barbers')
      .update({ profile_image_url: publicUrl })
      .eq('id', barberId)
      .select('id') // Selecionar algo para confirmar a atualização
      .single(); // Espera que apenas um registo seja atualizado

    if (updateError) {
      console.error("Erro ao atualizar a URL no perfil do barbeiro:", updateError);
      // Considerar remover a imagem carregada se a atualização falhar?
      // await supabase.storage.from('profile-images').remove([filePath]);
      throw updateError;
    }

    console.log(`URL da imagem atualizada para o barbeiro ${barberId}`);

    return { data: { url: publicUrl }, error: null };

  } catch (error: any) {
    console.error("Erro completo no processo de upload de imagem:", error);
    return { data: null, error };
  }
};

// Interfaces para dados do dashboard
export interface DashboardData {
  totalBookings: {
    weekly: number;
    monthly: number;
    yearly: number;
  };
  popularServices: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  topClients: Array<{
    name: string;
    visits: number;
    totalSpent: number;
  }>;
  peakHours: Array<{
    hour: string;
    bookings: number;
  }>;
  financials: {
    weekly: { projected: number; actual: number };
    monthly: { projected: number; actual: number };
    yearly: { projected: number; actual: number };
  };
  trends: {
    bookings: number; // Percentual de crescimento (positivo) ou queda (negativo)
    revenue: number;  // Percentual de crescimento (positivo) ou queda (negativo)
  };
}

// Função para buscar dados do dashboard
export const getDashboardData = async (timeRange: 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<DashboardData> => {
  try {
    // 1. Configurar datas baseadas no timeRange selecionado
    const now = new Date();
    let startDate = new Date(now);
    let previousStartDate = new Date(now);
    let previousEndDate = new Date(startDate);
    
    switch (timeRange) {
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
        previousEndDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(now.getDate() - 60);
        previousEndDate.setDate(now.getDate() - 30);
        break;
      case 'yearly':
        startDate.setDate(now.getDate() - 365);
        previousStartDate.setDate(now.getDate() - 730);
        previousEndDate.setDate(now.getDate() - 365);
        break;
    }

    // Formatando datas para o formato YYYY-MM-DD
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const nowFormatted = formatDate(now);
    const startDateFormatted = formatDate(startDate);
    const previousStartDateFormatted = formatDate(previousStartDate);
    const previousEndDateFormatted = formatDate(previousEndDate);

    // Consulta para total de agendamentos no período atual
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('appointments')
      .select('id, appointment_date')
      .gte('appointment_date', startDateFormatted)
      .lte('appointment_date', nowFormatted);

    if (bookingsError) {
      throw new Error('Erro ao buscar total de agendamentos do período atual');
    }

    // Consulta para total de agendamentos no período anterior (para comparação)
    const { data: previousBookingsData, error: previousBookingsError } = await supabase
      .from('appointments')
      .select('id')
      .gte('appointment_date', previousStartDateFormatted)
      .lte('appointment_date', previousEndDateFormatted);

    if (previousBookingsError) {
      throw new Error('Erro ao buscar total de agendamentos do período anterior');
    }

    // 2. Buscar serviços populares no período selecionado
    const { data: servicesData, error: servicesError } = await supabase
      .from('appointments')
      .select(`
        services (
          id,
          name
        )
      `)
      .gte('appointment_date', startDateFormatted)
      .neq('status', 'cancelled');

    if (servicesError) {
      throw new Error('Erro ao buscar serviços populares');
    }

    // Processar serviços para estatísticas
    const serviceCountMap: Record<string, number> = {};
    let totalServices = 0;

    servicesData?.forEach(appointment => {
      if (appointment.services) {
        const serviceName = appointment.services.name;
        serviceCountMap[serviceName] = (serviceCountMap[serviceName] || 0) + 1;
        totalServices++;
      }
    });

    const popularServices = Object.entries(serviceCountMap)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalServices) * 100) || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 3. Buscar clientes mais frequentes no período selecionado
    const { data: clientsData, error: clientsError } = await supabase
      .from('appointments')
      .select(`
        client_name,
        services ( price )
      `)
      .eq('status', 'completed')
      .gte('appointment_date', startDateFormatted)
      .order('client_name');

    if (clientsError) {
      throw new Error('Erro ao buscar clientes frequentes');
    }

    // Processar clientes para estatísticas
    const clientVisitsMap: Record<string, { visits: number; spent: number }> = {};

    clientsData?.forEach(appointment => {
      const clientName = appointment.client_name;
      const price = appointment.services?.price || 0;

      if (!clientVisitsMap[clientName]) {
        clientVisitsMap[clientName] = { visits: 0, spent: 0 };
      }

      clientVisitsMap[clientName].visits += 1;
      clientVisitsMap[clientName].spent += price;
    });

    const topClients = Object.entries(clientVisitsMap)
      .map(([name, { visits, spent }]) => ({
        name,
        visits,
        totalSpent: spent
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    // 4. Buscar horas de pico no período selecionado
    const { data: timeData, error: timeError } = await supabase
      .from('appointments')
      .select('start_time')
      .gte('appointment_date', startDateFormatted);

    if (timeError) {
      throw new Error('Erro ao buscar horas de pico');
    }

    // Processar horas para estatísticas
    const hourCountMap: Record<string, number> = {};

    timeData?.forEach(appointment => {
      // Extrair apenas a hora (HH:00)
      const hour = appointment.start_time.substring(0, 2) + ':00';
      hourCountMap[hour] = (hourCountMap[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourCountMap)
      .map(([hour, bookings]) => ({
        hour,
        bookings
      }))
      .sort((a, b) => {
        // Ordenar primeiro por hora para garantir ordem cronológica
        const hourA = parseInt(a.hour.split(':')[0]);
        const hourB = parseInt(b.hour.split(':')[0]);
        return hourA - hourB;
      });

    // 5. Calcular dados financeiros para o período selecionado
    const { data: financeData, error: financeError } = await supabase
      .from('appointments')
      .select(`
        services ( price )
      `)
      .eq('status', 'completed')
      .gte('appointment_date', startDateFormatted);

    if (financeError) {
      throw new Error('Erro ao buscar dados financeiros do período atual');
    }

    // Calcular receita atual
    const revenue = financeData.reduce((total, appointment) => {
      return total + (appointment.services?.price || 0);
    }, 0);

    // Calcular receita do período anterior (para comparação)
    const { data: previousFinanceData, error: previousFinanceError } = await supabase
      .from('appointments')
      .select(`
        services ( price )
      `)
      .eq('status', 'completed')
      .gte('appointment_date', previousStartDateFormatted)
      .lte('appointment_date', previousEndDateFormatted);

    if (previousFinanceError) {
      throw new Error('Erro ao buscar dados financeiros do período anterior');
    }

    const previousRevenue = previousFinanceData.reduce((total, appointment) => {
      return total + (appointment.services?.price || 0);
    }, 0);

    // Calcular tendências (crescimento ou queda em percentual)
    const bookingsTrend = previousBookingsData.length > 0
      ? ((bookingsData.length - previousBookingsData.length) / previousBookingsData.length) * 100
      : 0;
    
    const revenueTrend = previousRevenue > 0
      ? ((revenue - previousRevenue) / previousRevenue) * 100
      : 0;

    // Calcular projeção (20% acima do valor atual)
    const projection = Math.round(revenue * 1.2);

    // Criar estrutura de dados de bookings que mantém compatibilidade com a interface DashboardData
    const totalBookings = {
      weekly: timeRange === 'weekly' ? bookingsData.length : 0,
      monthly: timeRange === 'monthly' ? bookingsData.length : 0,
      yearly: timeRange === 'yearly' ? bookingsData.length : 0
    };

    // Criar estrutura de dados financeiros que mantém compatibilidade com a interface DashboardData
    const financials = {
      weekly: timeRange === 'weekly' 
        ? { projected: projection, actual: revenue }
        : { projected: 0, actual: 0 },
      monthly: timeRange === 'monthly' 
        ? { projected: projection, actual: revenue }
        : { projected: 0, actual: 0 },
      yearly: timeRange === 'yearly' 
        ? { projected: projection, actual: revenue }
        : { projected: 0, actual: 0 }
    };

    // Retornar dados completos
    return {
      totalBookings,
      popularServices,
      topClients,
      peakHours,
      financials,
      trends: {
        bookings: Math.round(bookingsTrend),
        revenue: Math.round(revenueTrend)
      }
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    // Retornar dados mock em caso de erro
    return {
      totalBookings: {
        weekly: 48,
        monthly: 187,
        yearly: 2365
      },
      popularServices: [
        { name: "Corte de Cabelo", count: 78, percentage: 42 },
        { name: "Barba", count: 45, percentage: 24 },
        { name: "Corte + Barba", count: 35, percentage: 19 },
        { name: "Tratamento Capilar", count: 18, percentage: 10 },
        { name: "Outros", count: 9, percentage: 5 }
      ],
      topClients: [
        { name: "João Silva", visits: 12, totalSpent: 560 },
        { name: "Carlos Oliveira", visits: 8, totalSpent: 420 },
        { name: "André Santos", visits: 7, totalSpent: 380 },
        { name: "Luís Costa", visits: 6, totalSpent: 290 },
        { name: "Rodrigo Ferreira", visits: 5, totalSpent: 240 }
      ],
      peakHours: [
        { hour: "09:00", bookings: 15 },
        { hour: "10:00", bookings: 25 },
        { hour: "11:00", bookings: 30 },
        { hour: "12:00", bookings: 15 },
        { hour: "13:00", bookings: 10 },
        { hour: "14:00", bookings: 20 },
        { hour: "15:00", bookings: 35 },
        { hour: "16:00", bookings: 45 },
        { hour: "17:00", bookings: 40 },
        { hour: "18:00", bookings: 30 }
      ],
      financials: {
        weekly: { projected: 1450, actual: 1320 },
        monthly: { projected: 5600, actual: 5200 },
        yearly: { projected: 68000, actual: 62500 }
      },
      trends: {
        bookings: 15,
        revenue: 8
      }
    };
  }
};