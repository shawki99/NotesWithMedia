-- Visual Notes Storage Policies
-- Run this in your Supabase SQL editor after creating the note-images bucket

-- Create storage bucket (run this first in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('note-images', 'note-images', false);

-- Storage policies for note-images bucket
CREATE POLICY "read own images" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'note-images' AND split_part(name, '/', 1) = auth.uid()::text);

CREATE POLICY "insert own images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'note-images' AND split_part(name, '/', 1) = auth.uid()::text);

CREATE POLICY "update own images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'note-images' AND split_part(name, '/', 1) = auth.uid()::text)
WITH CHECK (bucket_id = 'note-images' AND split_part(name, '/', 1) = auth.uid()::text);

CREATE POLICY "delete own images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'note-images' AND split_part(name, '/', 1) = auth.uid()::text);
