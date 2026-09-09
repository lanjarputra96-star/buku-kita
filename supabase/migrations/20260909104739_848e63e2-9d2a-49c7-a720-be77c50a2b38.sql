CREATE POLICY "ebooks read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'ebooks');
CREATE POLICY "ebooks insert" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'ebooks');
CREATE POLICY "ebooks update" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'ebooks') WITH CHECK (bucket_id = 'ebooks');
CREATE POLICY "ebooks delete" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'ebooks');