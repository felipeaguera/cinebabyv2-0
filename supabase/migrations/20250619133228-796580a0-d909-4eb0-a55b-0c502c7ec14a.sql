
-- Criar enum para tipos de usuário
CREATE TYPE public.user_role AS ENUM ('admin', 'clinic');

-- Criar tabela de usuários do sistema
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'clinic',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir administrador padrão
INSERT INTO public.users (email, password, role) 
VALUES ('admin@cinebaby.online', 'admin123', 'admin');

-- Criar tabela de clínicas
CREATE TABLE public.clinics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de pacientes
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gestational_age TEXT NOT NULL,
  phone TEXT,
  qr_code TEXT NOT NULL UNIQUE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de vídeos
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar bucket para armazenar vídeos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = user_email AND role = 'admin'
  );
$$;

-- Habilitar RLS nas tabelas
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Políticas para clínicas
CREATE POLICY "Admin can manage all clinics" ON public.clinics
  FOR ALL USING (
    public.is_admin(current_setting('request.jwt.claims', true)::json->>'email')
  );

CREATE POLICY "Clinics can view own data" ON public.clinics
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
  );

-- Políticas para pacientes
CREATE POLICY "Admin can manage all patients" ON public.patients
  FOR ALL USING (
    public.is_admin(current_setting('request.jwt.claims', true)::json->>'email')
  );

CREATE POLICY "Clinics can manage own patients" ON public.patients
  FOR ALL USING (
    clinic_id IN (
      SELECT c.id FROM public.clinics c 
      JOIN public.users u ON c.user_id = u.id 
      WHERE u.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Políticas para vídeos
CREATE POLICY "Admin can manage all videos" ON public.videos
  FOR ALL USING (
    public.is_admin(current_setting('request.jwt.claims', true)::json->>'email')
  );

CREATE POLICY "Public can view videos" ON public.videos
  FOR SELECT USING (true);

CREATE POLICY "Clinics can manage their videos" ON public.videos
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT p.id FROM public.patients p
      JOIN public.clinics c ON p.clinic_id = c.id
      JOIN public.users u ON c.user_id = u.id
      WHERE u.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Políticas para storage de vídeos
CREATE POLICY "Public can view videos in storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Authenticated can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'videos');
