-- Atualização da função get_available_slots para considerar a disponibilidade de serviços por barbeiro
-- Execute este script no painel SQL do Supabase

CREATE OR REPLACE FUNCTION public.get_available_slots(
  p_barber_id uuid,
  p_date date,
  p_service_id uuid
)
RETURNS TABLE(
  start_time text,
  end_time text
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_service_duration int;
  v_day_of_week text;
  v_open_time time;
  v_close_time time;
  v_is_available boolean;
BEGIN
  -- Verificar se o barbeiro pode realizar este serviço
  SELECT EXISTS (
    SELECT 1 
    FROM public.service_barber_availability 
    WHERE service_id = p_service_id AND barber_id = p_barber_id
  ) INTO v_is_available;
  
  IF NOT v_is_available THEN
    RETURN;
  END IF;

  -- Obter a duração do serviço selecionado
  SELECT duration INTO v_service_duration
  FROM public.services
  WHERE id = p_service_id;
  
  IF v_service_duration IS NULL THEN
    RETURN;
  END IF;
  
  -- Determinar o dia da semana para obter horário de funcionamento
  v_day_of_week := LOWER(TO_CHAR(p_date, 'day'));
  
  -- Obter horário de funcionamento para este dia
  -- Aqui você precisará adaptar conforme sua tabela de horários de funcionamento
  -- Este é um exemplo com valores fixos
  CASE
    WHEN v_day_of_week LIKE '%monday%' THEN
      v_open_time := '09:00:00'::time;
      v_close_time := '19:00:00'::time;
    WHEN v_day_of_week LIKE '%tuesday%' THEN
      v_open_time := '09:00:00'::time;
      v_close_time := '19:00:00'::time;
    WHEN v_day_of_week LIKE '%wednesday%' THEN
      v_open_time := '09:00:00'::time;
      v_close_time := '19:00:00'::time;
    WHEN v_day_of_week LIKE '%thursday%' THEN
      v_open_time := '09:00:00'::time;
      v_close_time := '19:00:00'::time;
    WHEN v_day_of_week LIKE '%friday%' THEN
      v_open_time := '09:00:00'::time;
      v_close_time := '19:00:00'::time;
    WHEN v_day_of_week LIKE '%saturday%' THEN
      v_open_time := '09:00:00'::time;
      v_close_time := '17:00:00'::time;
    WHEN v_day_of_week LIKE '%sunday%' THEN
      RETURN; -- Domingo fechado
    ELSE
      RETURN;
  END CASE;
  
  -- Gerar slots de 30 em 30 minutos
  RETURN QUERY
  WITH time_slots AS (
    SELECT 
      t.slot_time::time as start_time,
      (t.slot_time + (v_service_duration || ' minutes')::interval)::time as end_time
    FROM generate_series(
      v_open_time, 
      (v_close_time - (v_service_duration || ' minutes')::interval), 
      '30 minutes'::interval
    ) as t(slot_time)
  ),
  booked_slots AS (
    SELECT 
      a.start_time::time as start_time,
      a.end_time::time as end_time
    FROM public.appointments a
    WHERE 
      a.appointment_date = p_date AND 
      a.barber_id = p_barber_id AND 
      a.status = 'scheduled'
  )
  SELECT 
    to_char(ts.start_time, 'HH24:MI') as start_time,
    to_char(ts.end_time, 'HH24:MI') as end_time
  FROM time_slots ts
  WHERE NOT EXISTS (
    SELECT 1
    FROM booked_slots bs
    WHERE 
      (ts.start_time < bs.end_time AND ts.end_time > bs.start_time)
  )
  ORDER BY ts.start_time;
END;
$$; 