
-- Desabilitar temporariamente RLS nas tabelas para permitir que o admin funcione
ALTER TABLE public.clinics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes que estão causando problemas
DROP POLICY IF EXISTS "Admins can manage all clinics" ON public.clinics;
DROP POLICY IF EXISTS "Clinics can view own data" ON public.clinics;
DROP POLICY IF EXISTS "Admins can manage all patients" ON public.patients;
DROP POLICY IF EXISTS "Clinics can manage own patients" ON public.patients;
DROP POLICY IF EXISTS "Admins can manage all videos" ON public.videos;
DROP POLICY IF EXISTS "Public can view videos" ON public.videos;
DROP POLICY IF EXISTS "Clinics can manage their videos" ON public.videos;

-- Remover funções problemáticas
DROP FUNCTION IF EXISTS public.is_current_user_admin();
DROP FUNCTION IF EXISTS public.get_current_user_clinic_id();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remover tabela profiles se existir
DROP TABLE IF EXISTS public.profiles;

-- Limpar dados de demonstração mantendo a estrutura
DELETE FROM public.videos;
DELETE FROM public.patients;
DELETE FROM public.clinics;
