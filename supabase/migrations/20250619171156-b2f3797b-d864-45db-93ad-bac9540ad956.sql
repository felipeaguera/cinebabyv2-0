
-- Primeiro, vamos verificar o estado atual das tabelas
SELECT 'clinics' as table_name, count(*) as count FROM public.clinics
UNION ALL
SELECT 'patients' as table_name, count(*) as count FROM public.patients
UNION ALL
SELECT 'videos' as table_name, count(*) as count FROM public.videos;

-- Limpar todas as tabelas na ordem correta (respeitando foreign keys)
DELETE FROM public.videos;
DELETE FROM public.patients;
DELETE FROM public.clinics;

-- Verificar se as tabelas estão vazias
SELECT 'clinics_after' as table_name, count(*) as count FROM public.clinics
UNION ALL
SELECT 'patients_after' as table_name, count(*) as count FROM public.patients
UNION ALL
SELECT 'videos_after' as table_name, count(*) as count FROM public.videos;

-- Garantir que as foreign keys estão configuradas corretamente para cascade delete
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_clinic_id_fkey;
ALTER TABLE public.patients ADD CONSTRAINT patients_clinic_id_fkey 
  FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;

ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS videos_patient_id_fkey;
ALTER TABLE public.videos ADD CONSTRAINT videos_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;
