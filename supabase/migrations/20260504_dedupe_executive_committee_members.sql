-- Preview duplicates before this migration deletes extra rows:
--
-- with duplicate_groups as (
--     select
--         section,
--         min(name) as sample_name,
--         min(coalesce(designation, '')) as sample_designation,
--         min(coalesce(sport, '')) as sample_sport,
--         coalesce(array_to_string(team, chr(31)), '') as team_key,
--         count(*) as duplicate_count,
--         array_agg(id order by
--             case when image_url is not null and image_url <> '' then 0 else 1 end,
--             display_order asc,
--             created_at asc
--         ) as ordered_ids
--     from public.executive_committee_members
--     group by
--         section,
--         lower(btrim(name)),
--         coalesce(lower(btrim(designation)), ''),
--         coalesce(lower(btrim(sport)), ''),
--         coalesce(array_to_string(team, chr(31)), '')
--     having count(*) > 1
-- )
-- select * from duplicate_groups;

with ranked as (
    select
        id,
        row_number() over (
            partition by
                section,
                lower(btrim(name)),
                coalesce(lower(btrim(designation)), ''),
                coalesce(lower(btrim(sport)), ''),
                coalesce(array_to_string(team, chr(31)), '')
            order by
                case when image_url is not null and image_url <> '' then 0 else 1 end,
                display_order asc,
                created_at asc
        ) as rn
    from public.executive_committee_members
)
delete from public.executive_committee_members
where id in (
    select id
    from ranked
    where rn > 1
);

create unique index if not exists uq_executive_committee_no_exact_duplicates
on public.executive_committee_members (
    section,
    lower(btrim(name)),
    coalesce(lower(btrim(designation)), ''),
    coalesce(lower(btrim(sport)), ''),
    coalesce(array_to_string(team, chr(31)), '')
);
