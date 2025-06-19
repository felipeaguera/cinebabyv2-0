
-- Associar a clínica existente ao usuário correto
UPDATE public.clinics 
SET user_id = (SELECT id FROM public.users WHERE email = 'pilarmed@exemplo.com')
WHERE email = 'pilarmed@exemplo.com';
