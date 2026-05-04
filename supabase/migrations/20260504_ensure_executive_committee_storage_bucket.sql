insert into storage.buckets (id, name, public)
values ('executive-committee', 'executive-committee', true)
on conflict (id) do update
set
    name = excluded.name,
    public = excluded.public;

drop policy if exists "Public can view executive committee storage objects" on storage.objects;
drop policy if exists "Authenticated users can manage executive committee storage objects" on storage.objects;

create policy "Public can view executive committee storage objects"
    on storage.objects
    for select
    to public
    using (bucket_id = 'executive-committee');

create policy "Authenticated users can manage executive committee storage objects"
    on storage.objects
    for all
    to authenticated
    using (bucket_id = 'executive-committee')
    with check (bucket_id = 'executive-committee');
