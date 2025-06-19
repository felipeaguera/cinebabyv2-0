
-- Recriar políticas básicas para permitir funcionamento das clínicas
-- sem afetar as funcionalidades existentes

-- Política para permitir que qualquer usuário autenticado crie clínicas
CREATE POLICY "Allow authenticated users to create clinics" ON public.clinics
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Política para permitir que qualquer usuário autenticado visualize clínicas
CREATE POLICY "Allow authenticated users to view clinics" ON public.clinics
  FOR SELECT TO authenticated
  USING (true);

-- Política para permitir que qualquer usuário autenticado atualize clínicas
CREATE POLICY "Allow authenticated users to update clinics" ON public.clinics
  FOR UPDATE TO authenticated
  USING (true);

-- Política para permitir que qualquer usuário autenticado crie pacientes
CREATE POLICY "Allow authenticated users to create patients" ON public.patients
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Política para permitir que qualquer usuário autenticado visualize pacientes
CREATE POLICY "Allow authenticated users to view patients" ON public.patients
  FOR SELECT TO authenticated
  USING (true);

-- Política para permitir que qualquer usuário autenticado atualizem pacientes
CREATE POLICY "Allow authenticated users to update patients" ON public.patients
  FOR UPDATE TO authenticated
  USING (true);

-- Política para permitir que qualquer usuário autenticado delete pacientes
CREATE POLICY "Allow authenticated users to delete patients" ON public.patients
  FOR DELETE TO authenticated
  USING (true);

-- Política para permitir que qualquer usuário autenticado crie vídeos
CREATE POLICY "Allow authenticated users to create videos" ON public.videos
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Política para permitir que qualquer usuário autenticado visualize vídeos
CREATE POLICY "Allow authenticated users to view videos" ON public.videos
  FOR SELECT TO authenticated
  USING (true);

-- Política para permitir que qualquer usuário autenticado atualizem vídeos
CREATE POLICY "Allow authenticated users to update videos" ON public.videos
  FOR UPDATE TO authenticated
  USING (true);

-- Política para permitir que qualquer usuário autenticado deletem vídeos
CREATE POLICY "Allow authenticated users to delete videos" ON public.videos
  FOR DELETE TO authenticated
  USING (true);

-- Reativar RLS nas tabelas
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
