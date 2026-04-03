-- Storage buckets and storage-object policies for public media used by
-- events, hall of fame, pre-gallery, and gallery management.

insert into storage.buckets (id, name, public)
values
    ('events', 'events', true),
    ('hall_of_fame', 'hall_of_fame', true),
    ('pregallery-images', 'pregallery-images', true),
    ('gallery-images', 'gallery-images', true)
on conflict (id) do nothing;

drop policy if exists "Allow public read" on storage.objects;
drop policy if exists "Allow authenticated upload" on storage.objects;
drop policy if exists "Allow public read hf" on storage.objects;
drop policy if exists "Allow authenticated upload hf" on storage.objects;
drop policy if exists "Public can view events storage objects" on storage.objects;
drop policy if exists "Authenticated users can manage events storage objects" on storage.objects;
drop policy if exists "Public can view hall of fame storage objects" on storage.objects;
drop policy if exists "Authenticated users can manage hall of fame storage objects" on storage.objects;
drop policy if exists "Public can view pregallery storage objects" on storage.objects;
drop policy if exists "Authenticated users can manage pregallery storage objects" on storage.objects;
drop policy if exists "Public can view gallery storage objects" on storage.objects;
drop policy if exists "Authenticated users can manage gallery storage objects" on storage.objects;

create policy "Public can view events storage objects"
    on storage.objects
    for select
    to public
    using (bucket_id = 'events');

create policy "Authenticated users can manage events storage objects"
    on storage.objects
    for all
    to authenticated
    using (bucket_id = 'events' and auth.role() = 'authenticated')
    with check (bucket_id = 'events' and auth.role() = 'authenticated');

create policy "Public can view hall of fame storage objects"
    on storage.objects
    for select
    to public
    using (bucket_id = 'hall_of_fame');

create policy "Authenticated users can manage hall of fame storage objects"
    on storage.objects
    for all
    to authenticated
    using (bucket_id = 'hall_of_fame' and auth.role() = 'authenticated')
    with check (bucket_id = 'hall_of_fame' and auth.role() = 'authenticated');

create policy "Public can view pregallery storage objects"
    on storage.objects
    for select
    to public
    using (bucket_id = 'pregallery-images');

create policy "Authenticated users can manage pregallery storage objects"
    on storage.objects
    for all
    to authenticated
    using (bucket_id = 'pregallery-images' and auth.role() = 'authenticated')
    with check (bucket_id = 'pregallery-images' and auth.role() = 'authenticated');

create policy "Public can view gallery storage objects"
    on storage.objects
    for select
    to public
    using (bucket_id = 'gallery-images');

create policy "Authenticated users can manage gallery storage objects"
    on storage.objects
    for all
    to authenticated
    using (bucket_id = 'gallery-images' and auth.role() = 'authenticated')
    with check (bucket_id = 'gallery-images' and auth.role() = 'authenticated');

