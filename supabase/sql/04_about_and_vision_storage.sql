-- Storage, tables, and policies for About and Vision CMS images.

create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values
    ('about-images', 'about-images', true),
    ('vision-images', 'vision-images', true)
on conflict (id) do nothing;

create table if not exists public.about_images (
    id uuid primary key default gen_random_uuid(),
    image_url text not null,
    created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.vision_images (
    id uuid primary key default gen_random_uuid(),
    image_url text not null,
    created_at timestamptz not null default timezone('utc'::text, now())
);

alter table if exists public.about_images
    add column if not exists image_url text,
    add column if not exists created_at timestamptz default timezone('utc'::text, now());

alter table if exists public.vision_images
    add column if not exists image_url text,
    add column if not exists created_at timestamptz default timezone('utc'::text, now());

create index if not exists about_images_created_at_idx
    on public.about_images (created_at desc);

create index if not exists vision_images_created_at_idx
    on public.vision_images (created_at desc);

alter table if exists public.about_images enable row level security;
alter table if exists public.vision_images enable row level security;

drop policy if exists "Allow public select" on public.about_images;
drop policy if exists "Allow admin all" on public.about_images;
drop policy if exists "Public can view about images" on public.about_images;
drop policy if exists "Authenticated users can manage about images" on public.about_images;

create policy "Public can view about images"
    on public.about_images
    for select
    to public
    using (true);

create policy "Authenticated users can manage about images"
    on public.about_images
    for all
    to authenticated
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

drop policy if exists "Allow public select" on public.vision_images;
drop policy if exists "Allow admin all" on public.vision_images;
drop policy if exists "Public can view vision images" on public.vision_images;
drop policy if exists "Authenticated users can manage vision images" on public.vision_images;

create policy "Public can view vision images"
    on public.vision_images
    for select
    to public
    using (true);

create policy "Authenticated users can manage vision images"
    on public.vision_images
    for all
    to authenticated
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

drop policy if exists "about_vision_public_read" on storage.objects;
drop policy if exists "about_vision_admin_all" on storage.objects;
drop policy if exists "Public can view about storage objects" on storage.objects;
drop policy if exists "Authenticated users can manage about storage objects" on storage.objects;
drop policy if exists "Public can view vision storage objects" on storage.objects;
drop policy if exists "Authenticated users can manage vision storage objects" on storage.objects;

create policy "Public can view about storage objects"
    on storage.objects
    for select
    to public
    using (bucket_id = 'about-images');

create policy "Authenticated users can manage about storage objects"
    on storage.objects
    for all
    to authenticated
    using (bucket_id = 'about-images' and auth.role() = 'authenticated')
    with check (bucket_id = 'about-images' and auth.role() = 'authenticated');

create policy "Public can view vision storage objects"
    on storage.objects
    for select
    to public
    using (bucket_id = 'vision-images');

create policy "Authenticated users can manage vision storage objects"
    on storage.objects
    for all
    to authenticated
    using (bucket_id = 'vision-images' and auth.role() = 'authenticated')
    with check (bucket_id = 'vision-images' and auth.role() = 'authenticated');

