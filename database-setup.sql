-- Script de configuração de banco de dados para serviços da barbearia
-- Execute este script no painel SQL do Supabase

-- Tabela de serviços
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
);

-- Trigger para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger para a tabela services
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Aplicar trigger para a tabela service_barber_availability
CREATE TRIGGER update_service_barber_availability_updated_at
BEFORE UPDATE ON public.service_barber_availability
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Configurações de segurança para as tabelas
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_barber_availability ENABLE ROW LEVEL SECURITY;

-- Políticas para serviços (todos podem ler, apenas autenticados podem modificar)
CREATE POLICY "Permitir leitura de serviços para todos" ON public.services
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de serviços para administradores" ON public.services
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'role')::text = 'admin'
    );

CREATE POLICY "Permitir atualização de serviços para administradores" ON public.services
    FOR UPDATE USING (
        (auth.jwt() ->> 'role')::text = 'admin'
    );

CREATE POLICY "Permitir exclusão de serviços para administradores" ON public.services
    FOR DELETE USING (
        (auth.jwt() ->> 'role')::text = 'admin'
    );

-- Políticas para disponibilidade de serviços por barbeiro
CREATE POLICY "Permitir leitura de disponibilidade para todos" ON public.service_barber_availability
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de disponibilidade para administradores" ON public.service_barber_availability
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'role')::text = 'admin'
    );

CREATE POLICY "Permitir atualização de disponibilidade para administradores" ON public.service_barber_availability
    FOR UPDATE USING (
        (auth.jwt() ->> 'role')::text = 'admin'
    );

CREATE POLICY "Permitir exclusão de disponibilidade para administradores" ON public.service_barber_availability
    FOR DELETE USING (
        (auth.jwt() ->> 'role')::text = 'admin'
    ); 