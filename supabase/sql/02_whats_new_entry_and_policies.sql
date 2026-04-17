-- Row-level security and table policies for the main public schema.
-- This file assumes the core tables from 01_event_participant_management_schema.sql
-- already exist, but it guards each table so it can be rerun safely.

do $$
begin
    if to_regclass('public.registrations') is not null then
        alter table public.registrations enable row level security;

        drop policy if exists "Public Insert for Registrations" on public.registrations;
        drop policy if exists "Allow public to insert registrations" on public.registrations;
        drop policy if exists "Allow authenticated to manage registrations" on public.registrations;
        drop policy if exists "Allow authenticated to manage registrationss" on public.registrations;

        create policy "Allow public to insert registrations"
            on public.registrations
            for insert
            to public
            with check (true);

        create policy "Allow authenticated to manage registrations"
            on public.registrations
            for all
            to authenticated
            using (auth.role() = 'authenticated')
            with check (auth.role() = 'authenticated');
    end if;
end
$$;

do $$
begin
    if to_regclass('public.feedbacks') is not null then
        alter table public.feedbacks enable row level security;

        drop policy if exists "Public Insert for Feedbacks" on public.feedbacks;
        drop policy if exists "Allow public to insert feedbacks" on public.feedbacks;
        drop policy if exists "Allow authenticated to manage feedbacks" on public.feedbacks;

        create policy "Allow public to insert feedbacks"
            on public.feedbacks
            for insert
            to public
            with check (true);

        create policy "Allow authenticated to manage feedbacks"
            on public.feedbacks
            for all
            to authenticated
            using (auth.role() = 'authenticated')
            with check (auth.role() = 'authenticated');
    end if;
end
$$;

do $$
begin
    if to_regclass('public.calendar_events') is not null then
        alter table public.calendar_events enable row level security;

        drop policy if exists "Public Read for Calendar Events" on public.calendar_events;
        drop policy if exists "Allow all to read calendar_events" on public.calendar_events;
        drop policy if exists "Public can view calendar events" on public.calendar_events;
        drop policy if exists "Allow authenticated to manage calendar_events" on public.calendar_events;
        drop policy if exists "Authenticated users can manage calendar events" on public.calendar_events;

        create policy "Public can view calendar events"
            on public.calendar_events
            for select
            to public
            using (true);

        create policy "Authenticated users can manage calendar events"
            on public.calendar_events
            for all
            to authenticated
            using (auth.role() = 'authenticated')
            with check (auth.role() = 'authenticated');
    end if;
end
$$;

do $$
begin
    if to_regclass('public.calendar_settings') is not null then
        alter table public.calendar_settings enable row level security;

        drop policy if exists "Public Read for Calendar Settings" on public.calendar_settings;
        drop policy if exists "Allow all to read calendar_settings" on public.calendar_settings;
        drop policy if exists "Public can view calendar settings" on public.calendar_settings;
        drop policy if exists "Allow authenticated to manage calendar_settings" on public.calendar_settings;
        drop policy if exists "Authenticated users can manage calendar settings" on public.calendar_settings;

        create policy "Public can view calendar settings"
            on public.calendar_settings
            for select
            to public
            using (true);

        create policy "Authenticated users can manage calendar settings"
            on public.calendar_settings
            for all
            to authenticated
            using (auth.role() = 'authenticated')
            with check (auth.role() = 'authenticated');
    end if;
end
$$;

do $$
begin
    if to_regclass('public.whats_new') is not null then
        alter table public.whats_new enable row level security;

        drop policy if exists "Public Read for Whats New" on public.whats_new;
        drop policy if exists "Allow all to read whats_new" on public.whats_new;
        drop policy if exists "Public can view whats new" on public.whats_new;
        drop policy if exists "Allow authenticated to manage whats_new" on public.whats_new;
        drop policy if exists "Authenticated users can manage whats new" on public.whats_new;

        create policy "Public can view whats new"
            on public.whats_new
            for select
            to public
            using (true);

        create policy "Authenticated users can manage whats new"
            on public.whats_new
            for all
            to authenticated
            using (auth.role() = 'authenticated')
            with check (auth.role() = 'authenticated');
    end if;
end
$$;

do $$
begin
    if to_regclass('public.upcoming_events') is not null then
        alter table public.upcoming_events enable row level security;

        drop policy if exists "Public Read for Upcoming Events" on public.upcoming_events;
        drop policy if exists "Allow all to read upcoming_events" on public.upcoming_events;
        drop policy if exists "Public can view upcoming events" on public.upcoming_events;
        drop policy if exists "Allow authenticated to manage upcoming_events" on public.upcoming_events;
        drop policy if exists "Authenticated users can manage upcoming events" on public.upcoming_events;

        create policy "Public can view upcoming events"
            on public.upcoming_events
            for select
            to public
            using (true);

        create policy "Authenticated users can manage upcoming events"
            on public.upcoming_events
            for all
            to authenticated
            using (auth.role() = 'authenticated')
            with check (auth.role() = 'authenticated');
    end if;
end
$$;

do $$
begin
    if to_regclass('public.hall_of_fame') is not null then
        alter table public.hall_of_fame enable row level security;

        drop policy if exists "Public Read for Hall of Fame" on public.hall_of_fame;
        drop policy if exists "Allow all to read hall_of_fame" on public.hall_of_fame;
        drop policy if exists "Public can view hall of fame" on public.hall_of_fame;
        drop policy if exists "Allow authenticated to manage hall_of_fame" on public.hall_of_fame;
        drop policy if exists "Authenticated users can manage hall of fame" on public.hall_of_fame;

        create policy "Public can view hall of fame"
            on public.hall_of_fame
            for select
            to public
            using (true);

        create policy "Authenticated users can manage hall of fame"
            on public.hall_of_fame
            for all
            to authenticated
            using (auth.role() = 'authenticated')
            with check (auth.role() = 'authenticated');
    end if;
end
$$;

do $$
begin
    if to_regclass('public.pregallery_images') is not null then
        alter table public.pregallery_images enable row level security;

        drop policy if exists "Public can view pregallery images" on public.pregallery_images;
        drop policy if exists "Authenticated users can manage pregallery images" on public.pregallery_images;

        create policy "Public can view pregallery images"
            on public.pregallery_images
            for select
            to public
            using (true);

        create policy "Authenticated users can manage pregallery images"
            on public.pregallery_images
            for all
            to authenticated
            using (auth.role() = 'authenticated')
            with check (auth.role() = 'authenticated');
    end if;
end
$$;

do $$
begin
    if to_regclass('public.gallery_categories') is not null then
        alter table public.gallery_categories enable row level security;

        drop policy if exists "Public can view gallery categories" on public.gallery_categories;
        drop policy if exists "Authenticated users can manage gallery categories" on public.gallery_categories;

        create policy "Public can view gallery categories"
            on public.gallery_categories
            for select
            to public
            using (true);

        create policy "Authenticated users can manage gallery categories"
            on public.gallery_categories
            for all
            to authenticated
            using (auth.role() = 'authenticated')
            with check (auth.role() = 'authenticated');
    end if;
end
$$;

do $$
begin
    if to_regclass('public.gallery_folders') is not null then
        alter table public.gallery_folders enable row level security;

        drop policy if exists "Public can view gallery folders" on public.gallery_folders;
        drop policy if exists "Authenticated users can manage gallery folders" on public.gallery_folders;

        create policy "Public can view gallery folders"
            on public.gallery_folders
            for select
            to public
            using (true);

        create policy "Authenticated users can manage gallery folders"
            on public.gallery_folders
            for all
            to authenticated
            using (auth.role() = 'authenticated')
            with check (auth.role() = 'authenticated');
    end if;
end
$$;

do $$
begin
    if to_regclass('public.gallery_images') is not null then
        alter table public.gallery_images enable row level security;

        drop policy if exists "Public can view gallery images" on public.gallery_images;
        drop policy if exists "Authenticated users can manage gallery images" on public.gallery_images;

        create policy "Public can view gallery images"
            on public.gallery_images
            for select
            to public
            using (true);

        create policy "Authenticated users can manage gallery images"
            on public.gallery_images
            for all
            to authenticated
            using (auth.role() = 'authenticated')
            with check (auth.role() = 'authenticated');
    end if;
end
$$;

