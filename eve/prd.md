Product Requirements Document (PRD)
Project: CESC Officers Sports Club Website Enhancement

Prepared for: CESC Officers Sports Club
Prepared by: Project Owner
Version: 1.0
Date: March 2026

1. Project Overview

The CESC Officers Sports Club website is already developed and deployed. This PRD outlines UI, database, and admin panel enhancements required to improve:

Event management

Executive committee presentation

Data export capability

Dynamic gallery management

Navbar navigation

Dynamic pre-gallery images

The main objective is to increase administrative control through the admin panel and improve content flexibility without developer involvement.

2. Goals & Objectives
Primary Goals

Increase admin control over dynamic content

Improve UI structure and layout

Enable data export functionality

Convert static sections into fully dynamic modules

Secondary Goals

Improve website organization

Improve scalability

Make gallery easily manageable

3. Existing System Summary

Current features include:

Dynamic event calendar

Static executive committee layout

Static pre-gallery section

Static gallery with 67 shuffled images

Event registration

Feedback submission

Admin panel controlling some content

4. Functional Requirements
4.1 Calendar Enhancement (Add Event Time)
Current Behavior

Admin can schedule events in the calendar but no event time exists.

Required Change

Add event time support to the calendar.

Functional Behavior

Admin must be able to:

Add event

Add event date

Add event time

Edit event

Delete event

Calendar must display:

Event title

Event date

Event time

Database Change Required

Yes.

Add a column:

event_time TIME

or if using timestamp:

event_datetime TIMESTAMP
Recommended Schema Update

Table: events

Add column:

event_time TIME NOT NULL
UI Change

Calendar event display format:

Event Name
Date
Time

Example:

Cricket Tournament
12 April 2026
4:30 PM
4.2 Executive Committee Layout Restructure
Current Issue

Executive committee section layout is not properly structured.

Required Layout Structure

The section must follow this order:

Leadership
↓
General Secretary
↓
Sports Mentors
↓
Core Management
Leadership Section

Two cards displayed side-by-side.

Cards:

Mr. Kapil Thapar
President

Mr. Shubir Verma
Chief Patron

Design Requirement

Both images must have same dimensions

Use Kapil Thapar image dimension as reference

Shubir Verma image must match it

UI Behavior
[Kapil Thapar]    [Shubir Verma]
President         Chief Patron
General Secretary Section

Below leadership section with a divider.

Card:

Suhas Chakraborty
General Secretary

Centered card layout.

Sports Mentors Section

Next section below General Secretary.

Contains existing mentor cards.

No structural change required.

Core Management Section

Last section.

Contains operational members.

No changes to content required.

4.3 Registration and Feedback Data Export
Current Behavior

Admin can view data but cannot download it.

Required Feature

Admin must be able to download data as CSV.

Modules

Event Registration

Feedback

Admin Panel Changes

Add button:

Download CSV
Functional Behavior

Admin clicks:

Export CSV

System downloads file:

event_registrations.csv
feedback_responses.csv
CSV Format Example

Event Registration

The current registration form includes:

Employee Code

Full Name

Location

Organisation

Department

Designation

Email Address

Interested Sports (multi-select checkbox list)

CSV export

Add a Download CSV button in the admin registrations section.

When clicked, it should export all registration entries into a .csv file downloadable to the local computer.

E. CSV columns for registration export

Use this column order:

Employee Code
Full Name
Location
Organisation
Department
Designation
Email Address
Interested Sports
Submitted At

For Interested Sports, export values as comma-separated text like:

Cricket, Football, Chess
F. Validation

Keep or improve current validation:

Employee Code should be exactly 6 digits

Email should be valid format

At least one sport should be selectable if the existing business logic requires it

Do not break current form behavior.

Feedback

The current feedback form includes:

Name (Optional)

Email (Optional)

Employee Code (Optional)

Contact Number (Optional)

Location (Optional)

Organisation (Optional)

Department (Optional)

Experience Rating (5-star rating)

Feedback Type:

Suggestion

Complaint

Appreciation

Message

There is also a note saying personal details are not mandatory.

API endpoint example:

/admin/export/registrations
/admin/export/feedback

Export format: .csv
CSV columns for feedback export

Use this order:

Name
Email
Employee Code
Contact Number
Location
Organisation
Department
Experience Rating
Feedback Type
Message
Submitted At

Blank optional values should remain blank in CSV, not null-like broken text unless your export standard already handles nulls cleanly.

4.4 Pre-Gallery Dynamic Control
Current Behavior

Home page has 3 static images.

Section title:

Moments from CESC Officers Sports Club
Required Change

Make this section dynamic.

Admin Panel Addition

Add module:

Pre-Gallery Manager

Admin must be able to:

Upload image 1

Upload image 2

Upload image 3

Replace images anytime

Upload Source

Local device upload.

Storage

Recommended: storage bucket

pregallery-images
Database Structure

Table:

pregallery_images

Fields:

id
image_url
display_order
uploaded_at
Important Requirement

❗ Do not enforce image size limits

Images may be high resolution.

4.5 Navbar Navigation Change
Current Navbar
Home
About
Vision & Mission
Gallery
Calendar
Register
Contact
Feedback
Required Navbar
Home
About
Vision & Mission
Gallery
Executive Committee
Register
Feedback
Change Details

Remove:

Contact

Add:

Executive Committee
Functional Behavior

Clicking:

Executive Committee

Scrolls or navigates to:

Executive Committee section
4.6 Gallery System (Major Feature)

This is the largest change in the system.

Current Gallery

Static

67 images

Random shuffle

Required Gallery System

Gallery must become:

Fully Dynamic
Admin Controlled
Categorized
Gallery Structure

Gallery must contain 6 categories (folders):

Cricket

Football

Badminton

Lawn Tennis

Table Tennis

Workshops

Gallery Page Structure

When user clicks Gallery:

First Section

Pre-Gallery images displayed.

Second Section

Six folders displayed as cards.

Cricket
Football
Badminton
Lawn Tennis
Table Tennis
Workshops

Each folder clickable.

Folder Behavior

Clicking a folder opens:

Gallery Grid

Example:

Cricket Gallery

Shows:

All cricket photos.

Admin Panel Controls

Admin must be able to:

Add Photo

Select category

Upload from local device

Delete Photo

Remove image from gallery.

Change Category

Move photo between folders.

Database Design
Table: gallery_categories
id
name
created_at

Values:

cricket
football
badminton
lawn_tennis
table_tennis
workshops
Table: gallery_images
id
image_url
category_id
uploaded_at
Storage

Use storage bucket:

gallery-images
Admin Panel UI

Add section:

Gallery Manager

Options:

Upload Image
Select Category
Delete Image
View Folder Images
Image Upload Rules

Upload from local device

No strict image size limit

Allow high resolution images

5. Non-Functional Requirements
Performance

Gallery must load efficiently.

Security

Admin access must require authentication.

Storage

Use optimized image storage.

Scalability

Gallery should support 1000+ images.

6. Admin Panel New Modules

Admin panel must include:

Calendar Manager
Pre-Gallery Manager
Gallery Manager
Registration Data Export
Feedback Data Export
7. UI Changes Summary
Section	Change
Calendar	Add event time
Executive Committee	Layout restructure
Pre-Gallery	Dynamic images
Navbar	Add Executive Committee
Registration	CSV export
Feedback	CSV export
Gallery	Fully dynamic categorized gallery
8. Database Changes Summary

New tables:

pregallery_images
gallery_categories
gallery_images

Modify table:

events → add event_time
9. Priority Level
High Priority

Gallery system

CSV export

Calendar time column

Medium Priority

Pre-gallery dynamic control

Executive committee layout

Low Priority

Navbar reorder

10. Acceptance Criteria

Feature will be considered complete when:

Admin can upload gallery images

Images appear in correct folders

Pre-gallery images can be replaced

Event time shows in calendar

CSV export downloads successfully

Executive committee layout matches required order

Navbar includes Executive Committee