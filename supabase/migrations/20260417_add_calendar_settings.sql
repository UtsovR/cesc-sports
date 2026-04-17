create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

create table if not exists public.calendar_settings (
    id bigint primary key default 1,
    fy_label text not null default 'FY 25-26',
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.calendar_settings
    add column if not exists fy_label text default 'FY 25-26',
    add column if not exists created_at timestamptz default timezone('utc', now()),
    add column if not exists updated_at timestamptz default timezone('utc', now());

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'calendar_settings_single_row'
          and conrelid = 'public.calendar_settings'::regclass
    ) then
        alter table public.calendar_settings
            add constraint calendar_settings_single_row
            check (id = 1);
    end if;
end
$$;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'calendar_settings_fy_label_not_blank'
          and conrelid = 'public.calendar_settings'::regclass
    ) then
        alter table public.calendar_settings
            add constraint calendar_settings_fy_label_not_blank
            check (char_length(btrim(fy_label)) > 0);
    end if;
end
$$;

insert into public.calendar_settings (id, fy_label)
values (1, 'FY 25-26')
on conflict (id) do nothing;

update public.calendar_settings
set
    fy_label = btrim(coalesce(fy_label, 'FY 25-26')),
    created_at = coalesce(created_at, timezone('utc', now())),
    updated_at = coalesce(updated_at, created_at, timezone('utc', now()))
where id = 1
  and (
    fy_label is null
    or fy_label <> btrim(fy_label)
    or created_at is null
    or updated_at is null
  );

drop trigger if exists set_calendar_settings_updated_at on public.calendar_settings;

create trigger set_calendar_settings_updated_at
    before update on public.calendar_settings
    for each row execute function public.set_row_updated_at();

alter table public.calendar_settings enable row level security;

do $$
begin
    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'calendar_settings'
          and policyname = 'Public can view calendar settings'
    ) then
        create policy "Public can view calendar settings"
            on public.calendar_settings
            for select
            to public
            using (true);
    end if;
end
$$;

do $$
begin
    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'calendar_settings'
          and policyname = 'Authenticated users can manage calendar settings'
    ) then
        create policy "Authenticated users can manage calendar settings"
            on public.calendar_settings
            for all
            to authenticated
            using (true)
            with check (true);
    end if;
end
$$;
