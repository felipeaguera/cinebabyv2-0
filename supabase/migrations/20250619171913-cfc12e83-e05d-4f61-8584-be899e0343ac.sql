
-- Verificar e ajustar a estrutura das tabelas
-- Adicionar user_id como NOT NULL na tabela clinics se ainda não estiver
ALTER TABLE public.clinics 
ALTER COLUMN user_id SET NOT NULL;

-- Adicionar constraint única para email e user_id
ALTER TABLE public.clinics 
ADD CONSTRAINT clinics_email_unique UNIQUE (email);

ALTER TABLE public.clinics 
ADD CONSTRAINT clinics_user_id_unique UNIQUE (user_id);

-- Verificar se as foreign keys estão corretas
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_clinic_id_fkey;
ALTER TABLE public.patients ADD CONSTRAINT patients_clinic_id_fkey 
  FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;

ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS videos_patient_id_fkey;
ALTER TABLE public.videos ADD CONSTRAINT videos_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Adicionar RLS policies para proteger os dados por clínica
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Policies para clinics: cada clínica só vê seus próprios dados
CREATE POLICY "Clinics can view their own data" 
  ON public.clinics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Clinics can update their own data" 
  ON public.clinics 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policies para patients: cada clínica só vê seus próprios pacientes
CREATE POLICY "Clinics can view their own patients" 
  ON public.patients 
  FOR ALL
  USING (
    clinic_id IN (
      SELECT id FROM public.clinics WHERE user_id = auth.uid()
    )
  );

-- Policies para videos: cada clínica só vê vídeos de seus pacientes
CREATE POLICY "Clinics can view videos of their patients" 
  ON public.videos 
  FOR ALL
  USING (
    patient_id IN (
      SELECT p.id FROM public.patients p
      JOIN public.clinics c ON p.clinic_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Policy especial para admin ver tudo
CREATE POLICY "Admin can view all clinics" 
  ON public.clinics 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'admin@cinebaby.online'
    )
  );

CREATE POLICY "Admin can view all patients" 
  ON public.patients 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'admin@cinebaby.online'
    )
  );

CREATE POLICY "Admin can view all videos" 
  ON public.videos 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'admin@cinebaby.online'
    )
  );
