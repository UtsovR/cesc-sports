# CESC Officers Sports Club Website Enhancement TODO

Source: `eve/prd.md`

## Implementation Order

- [ ] High priority: dynamic gallery system
- [ ] High priority: registration and feedback CSV export
- [ ] High priority: calendar event time support
- [ ] Medium priority: pre-gallery dynamic control
- [ ] Medium priority: executive committee layout restructure
- [ ] Low priority: navbar navigation update

## 1. Calendar Enhancement: Add Event Time

- [x] Review current calendar data flow in user and admin views
- [x] Confirm current database table/column naming for calendar events
- [x] Create a safe migration to add `event_time` if it does not already exist
- [x] Backfill or handle existing rows that do not yet have a time value
- [x] Update TypeScript types/interfaces for calendar event records
- [x] Update admin calendar form to capture event time
- [x] Update admin edit flow so time can be changed
- [x] Update admin create flow so time is saved correctly
- [x] Update admin list/table view to display event time
- [x] Update public calendar view to display event name, date, and time
- [x] Format time consistently for display, preferably human-readable
- [x] Handle empty or legacy time values without breaking existing events
- [x] Verify create, edit, delete, and display flows still work end to end

## 2. Executive Committee Layout Restructure

- [x] Review current committee component structure and section order
- [x] Reorder the page sections to match the PRD:
- [x] Leadership
- [x] General Secretary
- [x] Sports Mentors
- [x] Core Management
- [x] Update leadership section to show exactly two side-by-side cards
- [x] Ensure Kapil Thapar card remains visually correct
- [x] Update Chief Patron card to use matching image dimensions
- [x] Add or keep a divider below leadership
- [x] Keep General Secretary as a centered standalone card below leadership
- [x] Preserve existing Sports Mentors content and styling as much as possible
- [x] Move Core Management to the final section
- [x] Verify responsive behavior on mobile and desktop
- [x] Confirm visual hierarchy matches the required order

## 3. Registration Data Export and Admin Improvements

### Database and Submission Handling

- [x] Review the current registrations table structure
- [x] Confirm all required fields are already stored:
- [x] employee code
- [x] full name
- [x] location
- [x] organisation
- [x] department
- [x] designation
- [x] email
- [x] interested sports
- [x] created/submitted timestamp
- [x] If needed, create a safe migration to add missing columns only
- [x] Confirm multi-select sports are stored in a scalable format
- [x] Normalize display logic so stored sports render cleanly in admin and export

### Registration Form Validation

- [x] Preserve existing UI and checkbox-based sports selection
- [x] Enforce exactly 6 digits for employee code
- [x] Keep email validation intact or improve it without UI regression
- [x] Ensure sports selection validation matches business rules
- [x] Handle malformed or empty sports payloads safely
- [x] Verify successful submission still resets/shows status correctly

### Admin Registrations Section

- [x] Review the existing registrations tab in admin
- [x] Ensure all submissions are fetched reliably
- [x] Display total registration count
- [x] Display all fields clearly in table/list format
- [x] Format interested sports as comma-separated readable text
- [x] Add loading state for registrations
- [x] Add empty state for no registrations
- [x] Add basic error state/message if fetch fails
- [x] Preserve or improve search by employee code and name if already practical

### Registration CSV Export

- [x] Add a `Download CSV` action to the admin registrations section
- [x] Create CSV generation utility for registrations
- [x] Export columns in this exact order:
- [x] Employee Code
- [x] Full Name
- [x] Location
- [x] Organisation
- [x] Department
- [x] Designation
- [x] Email Address
- [x] Interested Sports
- [x] Submitted At
- [x] Serialize multi-select sports as comma-separated text
- [x] Escape commas, quotes, and line breaks correctly
- [x] Use UTF-8 encoding
- [x] Use a clean filename such as `event_registrations.csv`
- [x] Ensure export works in browser on admin click
- [x] Keep export admin-protected
- [x] Verify CSV output with empty data and with special characters

## 4. Feedback Data Export and Admin Improvements

### Database and Submission Handling

- [x] Review the current feedback table structure
- [x] Confirm all required stored fields exist:
- [x] name
- [x] email
- [x] employee code
- [x] contact number
- [x] location
- [x] organisation
- [x] department
- [x] experience rating
- [x] feedback type
- [x] message
- [x] created/submitted timestamp
- [x] If needed, create a safe migration to add missing columns only
- [x] Confirm optional identity fields remain optional in storage logic
- [x] Ensure minimum business fields are always stored:
- [x] experience rating
- [x] feedback type
- [x] message
- [x] submitted timestamp

### Feedback Form Validation

- [x] Preserve the current card layout and star rating UI
- [x] Keep personal detail fields optional
- [x] Ensure rating is required if business logic requires it
- [x] Ensure feedback type is required if business logic requires it
- [x] Ensure message remains required
- [x] Handle long messages and blank optional fields safely
- [x] Verify anonymous/discreet submission still works

### Admin Feedback Section

- [x] Review the existing feedback tab in admin
- [x] Display total feedback count
- [x] Display rating, type, message, and optional personal details clearly
- [x] Mark or infer anonymous/discreet feedback where identity fields are blank
- [x] Add loading state for feedback
- [x] Add empty state for no feedback entries
- [x] Add basic error state/message if fetch fails
- [x] Preserve or improve search/filter support where practical
- [x] Add feedback type filtering if quick to support

### Feedback CSV Export

- [x] Add a `Download CSV` action to the admin feedback section
- [x] Create CSV generation utility for feedback data
- [x] Export columns in this exact order:
- [x] Name
- [x] Email
- [x] Employee Code
- [x] Contact Number
- [x] Location
- [x] Organisation
- [x] Department
- [x] Experience Rating
- [x] Feedback Type
- [x] Message
- [x] Submitted At
- [x] Export blank optional values as blank cells
- [x] Escape commas, quotes, and line breaks correctly
- [x] Use UTF-8 encoding
- [x] Use a clean filename such as `feedback_responses.csv`
- [x] Ensure export works in browser on admin click
- [x] Keep export admin-protected
- [x] Verify CSV output with anonymous feedback and special characters

## 5. Pre-Gallery Dynamic Control

### Database and Storage

- [x] Create `pregallery_images` table if it does not already exist
- [x] Include fields:
- [x] `id`
- [x] `image_url`
- [x] `display_order`
- [x] `uploaded_at`
- [x] Create or verify storage bucket for `pregallery-images`
- [x] Define ordering rules so exactly three home-page images can be rendered predictably

### Admin Pre-Gallery Manager

- [x] Add a new admin section for pre-gallery management
- [x] Show current image 1, image 2, and image 3
- [x] Add upload control for each slot
- [x] Allow replacing each image independently
- [x] Preserve existing admin theme styling
- [x] Add upload loading state
- [x] Add empty state if no pre-gallery images exist yet
- [x] Add basic error handling for upload failures
- [x] Do not enforce artificial image size limits in UI logic

### Frontend Home Page Integration

- [x] Replace hardcoded pre-gallery preview images with dynamic data
- [x] Fetch the three ordered images from the new table/storage source
- [x] Preserve the current section title and overall home-page look
- [x] Preserve click behavior to navigate to the gallery page
- [x] Add loading and fallback states if data is missing
- [x] Verify updated images appear without code changes

## 6. Navbar Navigation Change

- [x] Review current navbar and footer navigation links
- [x] Remove `Contact` from the main navbar
- [x] Add `Executive Committee` to the navbar
- [x] Route `Executive Committee` to the committee section/page
- [x] Keep mobile menu behavior aligned with desktop navigation
- [x] Check for any now-unused contact page logic in the app shell
- [x] Update footer links if needed to remain consistent
- [x] Verify navigation behavior on desktop and mobile

## 7. Dynamic Gallery System

### Database and Storage Design

- [x] Create `gallery_categories` table if it does not already exist
- [x] Seed or insert the required categories:
- [x] cricket
- [x] football
- [x] badminton
- [x] lawn_tennis
- [x] table_tennis
- [x] workshops
- [x] Create `gallery_images` table if it does not already exist
- [x] Include fields:
- [x] `id`
- [x] `image_url`
- [x] `category_id`
- [x] `uploaded_at`
- [x] Create or verify storage bucket for `gallery-images`
- [x] Ensure schema supports large numbers of images cleanly

### Admin Gallery Manager

- [x] Add a `Gallery Manager` section to admin
- [x] Fetch and display available categories
- [x] Add image upload flow from local device
- [x] Add category selector during upload
- [x] Store uploaded image and save DB record
- [x] Add list/grid view of uploaded images by category
- [x] Add ability to delete an image
- [x] Add ability to move an image to a different category
- [x] Add loading, empty, and error states
- [x] Preserve the current admin theme styling
- [x] Do not enforce strict file size limits in UI logic

### Public Gallery Page

- [x] Replace static shuffled gallery asset loading with dynamic data
- [x] Keep pre-gallery images as the first section of the gallery page
- [x] Add category folder/cards section below pre-gallery
- [x] Render the six categories as clickable cards
- [x] Define folder/card visuals consistent with the current site style
- [x] When a category is clicked, show only that category's images
- [x] Add a way to return from category view to the category list if needed
- [x] Add loading state while gallery data is fetched
- [x] Add empty state for categories with no images
- [x] Ensure gallery performance remains acceptable with many images

### Gallery Verification

- [x] Verify images upload successfully
- [x] Verify images appear in the correct category
- [x] Verify category changes are reflected on the public gallery
- [x] Verify image deletion removes records and storage references cleanly
- [x] Verify gallery still works on mobile and desktop

## 8. Admin Panel Module Updates

- [x] Review current admin tab structure
- [x] Ensure admin panel includes:
- [x] Calendar Manager
- [x] Pre-Gallery Manager
- [x] Gallery Manager
- [x] Registration Data Export
- [x] Feedback Data Export
- [x] Keep authentication requirements for all admin-only views and actions
- [x] Keep styling consistent with the existing admin theme
- [x] Add counts, loading states, empty states, and error handling where applicable
- [x] Avoid unrelated dashboard refactors beyond what these features require

## 9. Shared CSV Utility and Download Behavior

- [x] Decide whether to implement CSV generation client-side or through protected backend/admin service flow
- [x] Reuse one CSV escaping utility for registrations and feedback
- [x] Ensure UTF-8 output
- [x] Ensure commas, quotes, and multiline messages are escaped correctly
- [x] Ensure browser download filenames are meaningful
- [x] Verify no-data exports still produce valid CSV headers
- [x] Verify admin-only access to export actions

## 10. Database and Migration Safety

- [x] Audit the current schema before adding new tables or columns
- [x] Use additive, production-safe migrations only
- [x] Do not recreate existing tables unnecessarily
- [x] Do not remove or overwrite production data
- [x] Document any required manual setup:
- [x] storage buckets
- [x] seeded categories
- [x] policies or access rules
- [x] Verify old records remain readable after schema updates

## 11. QA and Acceptance Checklist

- [x] Registration form still submits successfully
- [x] Feedback form still submits successfully
- [x] Calendar event time can be created, edited, viewed, and persisted
- [x] Admin can export registration CSV successfully
- [x] Admin can export feedback CSV successfully
- [x] Pre-gallery images can be uploaded and replaced from admin
- [x] Home page pre-gallery section reflects admin-managed images
- [x] Gallery categories render correctly
- [x] Gallery images appear in the correct folders
- [x] Gallery images can be moved between folders
- [x] Gallery images can be deleted cleanly
- [x] Executive committee layout matches the required order
- [x] Navbar includes Executive Committee and no longer includes Contact
- [x] Existing UI styling remains substantially intact
- [x] No unrelated regressions are introduced

## 12. Suggested Delivery Plan

- [x] Phase 1: schema audit and safe migrations
- [x] Phase 2: calendar time and CSV export features
- [x] Phase 3: pre-gallery manager and dynamic home preview
- [x] Phase 4: full dynamic categorized gallery
- [x] Phase 5: executive committee and navbar cleanup
- [x] Phase 6: regression testing and final admin verification


