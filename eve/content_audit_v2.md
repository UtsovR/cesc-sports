# CESC Officers Sports Club Brand Messaging Audit V2

Source: `eve/prd_v2.md`

Date: April 2026

## Scope Reviewed

- Homepage hero
- About page
- Vision & Mission page
- Gallery introduction copy
- Registration page intro copy
- Footer tagline

## Content Inventory

### 1. Homepage Hero

File: `src/components/Hero.tsx`

Current messaging:

- Primary first-slide title metadata: `Excellence in Sports`
- Primary first-slide subtitle metadata: `Building Champions, Creating Legends`
- Visible first-slide content currently shows:
- `CESC Officer's Sports Club`

Audit notes:

- The first slide does not currently display the brand statement from `prd_v2`.
- The metadata on the first slide is generic and is not visible in the rendered first-slide layout.
- The hero currently emphasizes the club name and rotating sports images more than legacy or institutional identity.
- This is the most important content gap relative to the new PRD.

Alignment with `prd_v2`:

- Partial alignment through the word `Champions`
- Missing `fostering sporting excellence since 1995`
- Missing supporting heritage narrative

### 2. About Page

File: `src/components/About.tsx`

Current messaging:

- `About CESC Officers' Sports Club`
- `CESC Officers’ Sports Club (CESCOSC) was established in the year 1988...`
- `Over the years, the club has grown...`

Audit notes:

- The current About copy provides origin and growth context.
- The date `1988` conflicts directly with `prd_v2`, which is centered on `since 1995`.
- The section is informative but not brand-led.
- It does not clearly frame the club as a legacy institution focused on building champions and fostering excellence.

Alignment with `prd_v2`:

- Strong base for history and sports culture
- Direct year conflict with the PRD
- Needs stronger heritage, character-development, and institutional-value framing

### 3. Vision & Mission

File: `src/components/Vision.tsx`

Current messaging:

- Vision:
- `To foster a sporting culture among CESC Officers which transpires to better teamwork, increased productivity, improved well-being and enhanced work-life balance.`
- Mission:
- `By organising various sports events and offering access to sporting facilities, we aim to motivate our CESC officers and their families to prioritize fitness. Additionally, we strive to develop talent and proudly represent CESC in numerous inter-corporate events.`

Audit notes:

- This section already aligns conceptually with sports culture, talent development, and participation.
- The language is functional and credible, but it does not yet connect strongly to legacy, champions, or excellence since 1995.
- This section likely needs refinement rather than a complete structural rewrite.

Alignment with `prd_v2`:

- Good alignment on participation, fitness, talent, and representation
- Missing direct legacy and excellence positioning
- Missing stronger emotional and institutional phrasing

### 4. Gallery Introduction

Files:

- `src/components/Gallery.tsx`
- `src/App.tsx`

Current messaging:

- Gallery page quote:
- `Every frame tells a story of passion, teamwork, and sporting excellence.`
- Gallery preview heading:
- `Moments from CESC Officers' Sports Club`
- Gallery folder intro:
- `Choose a sport or workshop folder to open its gallery.`

Audit notes:

- The gallery section already uses the word `excellence`, which is helpful.
- The current copy is visually clean and fairly concise.
- It does not reference the club's legacy or `since 1995`.
- This area can likely be updated with light-touch copy changes after major sections are approved.

Alignment with `prd_v2`:

- Good tonal starting point
- Missing heritage and institutional framing
- Good candidate for secondary refinement

### 5. Registration Page Intro

File: `src/components/Registration.tsx`

Current messaging:

- `Event Registration`
- `Join the CESC Sports Club tournaments and events.`

Audit notes:

- The registration heading is clear and functional.
- The supporting line is generic and does not reflect the new brand positioning.
- This section can be improved later with a participation-oriented line tied to excellence, opportunity, and club community.

Alignment with `prd_v2`:

- Functionally acceptable
- Weak brand alignment
- Low-risk copy update after hero, About, and Vision & Mission

### 6. Footer

File: `src/components/Footer.tsx`

Current messaging:

- `Building champions and fostering sporting excellence since 1995.`

Audit notes:

- The footer already uses the new core brand statement.
- This is the strongest existing alignment with `prd_v2`.
- The footer can serve as the tone anchor for the rest of the site copy.

Alignment with `prd_v2`:

- Fully aligned for the tagline itself

## Cross-Section Findings

### Existing phrases that already support the new PRD

- `Building champions` in the old hero subtitle direction
- `sporting excellence` in the gallery quote
- `foster a sporting culture` in Vision
- `develop talent` in Mission
- The full new tagline already exists in the footer

### Conflicts or outdated points

- About page says `1988`, while `prd_v2` centers the message on `since 1995`
- Hero does not visibly communicate heritage or the new statement
- Registration intro is too generic for the new direction
- Gallery and supporting sections do not yet reinforce the `since 1995` legacy marker

### Space and layout constraints

- Hero first slide has the biggest messaging opportunity, but the current glass card mainly shows the logo and club name
- About and Vision sections have comfortable space for richer copy without layout redesign
- Registration intro and footer should stay concise
- Gallery intro should remain short to preserve the page's visual rhythm

### Organizational confirmation still needed

- The biggest unresolved content decision is whether `1988` on the About page is historically correct and should remain, or whether the new PRD intentionally shifts official messaging to `since 1995`
- This requires user confirmation before any live copy replacement

## Recommended Execution Order

1. Confirm official year reference before changing About or heritage messaging
2. Draft homepage hero copy and get user approval
3. Draft About copy with approved year reference and get user approval
4. Draft Vision & Mission refinements and get user approval
5. Apply lighter consistency updates to gallery, registration, and footer only after the main copy direction is approved

