
-- Política para permitir que clínicas façam upload de vídeos
CREATE POLICY "Clinics can upload videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'videos');

-- Política para permitir acesso público aos vídeos (para pacientes)
CREATE POLICY "Public can view videos" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

-- Política para permitir que clínicas excluam seus vídeos
CREATE POLICY "Clinics can delete videos" ON storage.objects
FOR DELETE USING (bucket_id = 'videos');
