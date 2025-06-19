
-- Limpar todos os dados de demonstração, mantendo apenas o administrador
DELETE FROM public.videos;
DELETE FROM public.patients;
DELETE FROM public.clinics;
DELETE FROM public.users WHERE role = 'clinic';

-- Resetar sequências se necessário
-- (não aplicável aqui pois usamos UUIDs)
