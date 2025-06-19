
-- Remover a constraint de chave estrangeira problemática
ALTER TABLE public.clinics DROP CONSTRAINT IF EXISTS clinics_user_id_fkey;

-- Remover a tabela users que não está sendo usada corretamente
DROP TABLE IF EXISTS public.users;

-- A tabela clinics vai continuar com user_id mas sem constraint,
-- já que vamos usar auth.users que é gerenciado pelo Supabase
-- e não podemos criar foreign keys para ele
