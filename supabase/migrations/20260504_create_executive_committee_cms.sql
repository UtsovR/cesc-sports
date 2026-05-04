create extension if not exists pgcrypto;

create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

create table if not exists public.executive_committee_members (
    id uuid primary key default gen_random_uuid(),
    section text not null,
    name text not null,
    designation text,
    sport text,
    team text[],
    description text,
    image_url text,
    display_order integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.executive_committee_members
    add column if not exists section text,
    add column if not exists name text,
    add column if not exists designation text,
    add column if not exists sport text,
    add column if not exists team text[],
    add column if not exists description text,
    add column if not exists image_url text,
    add column if not exists display_order integer default 0,
    add column if not exists is_active boolean default true,
    add column if not exists created_at timestamptz default timezone('utc', now()),
    add column if not exists updated_at timestamptz default timezone('utc', now());

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'executive_committee_members_section_check'
          and conrelid = 'public.executive_committee_members'::regclass
    ) then
        alter table public.executive_committee_members
            add constraint executive_committee_members_section_check
            check (section in ('leadership', 'general_secretary', 'sports_mentor', 'core_management'));
    end if;

    if not exists (
        select 1
        from pg_constraint
        where conname = 'executive_committee_members_name_not_blank'
          and conrelid = 'public.executive_committee_members'::regclass
    ) then
        alter table public.executive_committee_members
            add constraint executive_committee_members_name_not_blank
            check (char_length(btrim(name)) > 0);
    end if;

    if not exists (
        select 1
        from pg_constraint
        where conname = 'executive_committee_leadership_designation_required'
          and conrelid = 'public.executive_committee_members'::regclass
    ) then
        alter table public.executive_committee_members
            add constraint executive_committee_leadership_designation_required
            check (
                section <> 'leadership'
                or char_length(btrim(coalesce(designation, ''))) > 0
            );
    end if;

    if not exists (
        select 1
        from pg_constraint
        where conname = 'executive_committee_general_secretary_designation_required'
          and conrelid = 'public.executive_committee_members'::regclass
    ) then
        alter table public.executive_committee_members
            add constraint executive_committee_general_secretary_designation_required
            check (
                section <> 'general_secretary'
                or char_length(btrim(coalesce(designation, ''))) > 0
            );
    end if;

    if not exists (
        select 1
        from pg_constraint
        where conname = 'executive_committee_sports_mentor_sport_required'
          and conrelid = 'public.executive_committee_members'::regclass
    ) then
        alter table public.executive_committee_members
            add constraint executive_committee_sports_mentor_sport_required
            check (
                section <> 'sports_mentor'
                or char_length(btrim(coalesce(sport, ''))) > 0
            );
    end if;

    if not exists (
        select 1
        from pg_constraint
        where conname = 'executive_committee_core_management_designation_required'
          and conrelid = 'public.executive_committee_members'::regclass
    ) then
        alter table public.executive_committee_members
            add constraint executive_committee_core_management_designation_required
            check (
                section <> 'core_management'
                or char_length(btrim(coalesce(designation, ''))) > 0
            );
    end if;
end
$$;

create index if not exists executive_committee_members_section_order_idx
    on public.executive_committee_members (section, display_order);

drop trigger if exists set_executive_committee_members_updated_at on public.executive_committee_members;

create trigger set_executive_committee_members_updated_at
    before update on public.executive_committee_members
    for each row execute function public.set_row_updated_at();

alter table public.executive_committee_members enable row level security;

drop policy if exists "Public can view active executive committee members" on public.executive_committee_members;
drop policy if exists "Authenticated users can manage executive committee members" on public.executive_committee_members;

create policy "Public can view active executive committee members"
    on public.executive_committee_members
    for select
    to public
    using (is_active = true);

create policy "Authenticated users can manage executive committee members"
    on public.executive_committee_members
    for all
    to authenticated
    using (true)
    with check (true);

insert into storage.buckets (id, name, public)
values ('executive-committee', 'executive-committee', true)
on conflict (id) do nothing;

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

with seed_members (
    section,
    name,
    designation,
    sport,
    team,
    description,
    image_url,
    display_order,
    is_active
) as (
    values
        ('leadership', 'Mr. Kapil Thapar', 'President', null, null::text[], null, 'asset:committee/president.jpeg', 1, true),
        ('leadership', 'Mr. Subir Verma', 'Chief Patron', null, null::text[], null, 'asset:committee/patron.jpeg', 2, true),
        ('leadership', 'Mr. Snehasis Shamaddar', 'Vice President', null, null::text[], null, 'asset:committee/vp1.jpeg', 3, true),
        ('leadership', 'Mr. Vernon Morais', 'Vice President', null, null::text[], null, 'asset:committee/vp2.png', 4, true),
        ('leadership', 'Mr. Bratin Ghosh', 'Mentor', null, null::text[], null, 'asset:committee/mentor.JPG', 5, true),
        ('general_secretary', 'Suhash Chakraborty', 'General Secretary', null, null::text[], 'Overseeing strategic initiatives and club administration.', 'asset:committee/image9.JPG', 1, true),
        ('sports_mentor', 'Sampad Ghosh', null, 'Tennis', array['Sangram Singha', 'Debmalya Datta'], null, 'asset:committee/image4.jpeg', 1, true),
        ('sports_mentor', 'Suvro Banerjee', null, 'Football', array['Soumik Nag Roy', 'Avik Mallick'], null, 'asset:committee/image5.jpeg', 2, true),
        ('sports_mentor', 'Majidur Islam', null, 'Cricket', array['Sourav Gupta', 'Arnab Choudhury'], null, 'asset:committee/image6.jpeg', 3, true),
        ('sports_mentor', 'Ramkrishna Shah', null, 'Table Tennis', array['Sujay Podder', 'Biswajit Saha'], null, 'asset:committee/image8.jpeg', 4, true),
        ('sports_mentor', 'Soumyajit Konar', null, 'Badminton', array['Sakya Singha Maity', 'Swagata Banerjee'], null, 'asset:committee/image7.png', 5, true),
        ('sports_mentor', 'Ms. Roshni Guhathakurta', null, 'Athletics', array['Sourya Banerjee'], null, 'asset:committee/image2.jpeg', 6, true),
        ('core_management', 'Kaushik Bhattacharya', 'Treasury', null, array['Pradipta Hati', 'Tanmoy Mishra'], null, 'asset:committee/image1.jpeg', 1, true),
        ('core_management', 'Amit Das', 'Branding & Talent Management', null, array['Arijit Mitra'], null, 'asset:committee/image3.JPG', 2, true),
        ('core_management', 'Roshni Guhathakurta', 'Communication', null, array['Tathagata Roy Chowdhury', 'Puskar Basu'], null, 'asset:committee/image2.jpeg', 3, true),
        ('core_management', 'Anindya Sen', 'Cultural', null, array['Nilanjan Daripa', 'Eshita Roy'], null, 'asset:committee/image10.jpeg', 4, true),
        ('core_management', 'Rajpura Majumder', 'Feedback & Grievance', null, array['Sujay Sahu'], null, 'asset:committee/image16.jpeg', 5, true)
)
insert into public.executive_committee_members
    (section, name, designation, sport, team, description, image_url, display_order, is_active)
select
    seed_members.section,
    seed_members.name,
    seed_members.designation,
    seed_members.sport,
    seed_members.team,
    seed_members.description,
    seed_members.image_url,
    seed_members.display_order,
    seed_members.is_active
from seed_members
where not exists (
    select 1
    from public.executive_committee_members existing
    where existing.section = seed_members.section
      and lower(btrim(existing.name)) = lower(btrim(seed_members.name))
      and coalesce(lower(btrim(existing.designation)), '') = coalesce(lower(btrim(seed_members.designation)), '')
      and coalesce(lower(btrim(existing.sport)), '') = coalesce(lower(btrim(seed_members.sport)), '')
      and coalesce(array_to_string(existing.team, chr(31)), '') = coalesce(array_to_string(seed_members.team, chr(31)), '')
);
