# Supabase Manual Setup Notes

These notes cover the schema and storage modules added for the calendar time, calendar settings, pre-gallery, and dynamic gallery work.

## Storage Buckets

- `pregallery-images`
- `gallery-images`

The migrations create these buckets if they do not already exist. They intentionally do not overwrite an existing bucket configuration, so if a bucket already exists with different settings, review it manually in Supabase.

## Seeded Categories

The dynamic gallery migration inserts the required category records if they are missing:

- `cricket`
- `football`
- `badminton`
- `lawn_tennis`
- `table_tennis`
- `workshops`

## Policies and Access Rules

The migrations create policies only when they are missing.

Expected table policies:

- Public `select` on `public.pregallery_images`
- Authenticated `all` on `public.pregallery_images`
- Public `select` on `public.gallery_categories`
- Authenticated `all` on `public.gallery_categories`
- Public `select` on `public.calendar_settings`
- Authenticated `all` on `public.calendar_settings`
- Public `select` on `public.gallery_folders`
- Authenticated `all` on `public.gallery_folders`
- Public `select` on `public.gallery_images`
- Authenticated `all` on `public.gallery_images`

Expected storage policies:

- Public `select` on `storage.objects` for bucket `pregallery-images`
- Authenticated `insert` and `delete` on `storage.objects` for bucket `pregallery-images`
- Public `select` on `storage.objects` for bucket `gallery-images`
- Authenticated `insert` and `delete` on `storage.objects` for bucket `gallery-images`

## Legacy Record Compatibility

- `public.calendar_events.event_time` is added as a nullable column, so existing calendar rows remain readable until times are backfilled.
- `public.calendar_settings` uses a single-row settings record keyed at `id = 1`, so the public FY label stays separate from individual event rows.
- The pre-gallery and gallery migrations are additive and do not drop or recreate existing content tables.
- Gallery folders use a self-referencing `parent_folder_id`, so top-level folders and nested sub-folders can coexist without flattening existing category data.
- `public.gallery_images.folder_id` is nullable, so existing gallery images stay valid even before they are assigned to a folder.
- Seed inserts use conflict-safe behavior, so existing gallery category records are preserved.
