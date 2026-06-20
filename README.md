Create a brand new Next.js hotel website project from 
scratch. Initialize the project yourself with the best 
current stack following latest stable releases and 
current best practices. Do not reference or carry over 
any existing code.

INITIALIZE THE PROJECT WITH:
- Next.js 15 (app router)
- TypeScript
- Tailwind CSS v4
- ESLint
- Choose any additional libraries you consider best 
  practice for a modern Next.js project in 2025

FONTS:
- Install @fontsource/general-sans via npm for 
  General Sans Medium
- Import Quicksand Medium via next/font/google
- General Sans for all body text and UI elements
- Quicksand for all headings and display text

COLORS:
- White background: #FFFFFF
- Black: #151316
- Gray: #3D3D3D with multiple shades — apply a subtle 
  CSS grainy texture to all gray elements using an 
  SVG noise filter
- One contrasted accent color of your choice that 
  complements the palette — use it sparingly

SECTION 1 — HERO:
- Fixed navbar at the very top: hotel name on the left 
  in Quicksand, navigation links on the right in 
  General Sans, a small accent-colored Reserve button 
  far right
- Directly below the navbar: a large centered box with 
  white padding on all four sides between it and the 
  screen edges
- Inside the box: a video as background, the video 
  file will be placed at /public/hero.mp4 — reference 
  it from there. The video must autoplay, loop, muted, 
  and have object-fit cover
- Overlaid on the bottom half of the video inside the 
  box: a frosted glass reservation bar containing:
    * Number of persons selector (1-10)
    * Check-in date picker
    * Check-out date picker
    * A search/availability button in the accent color
  The reservation bar must be semi-transparent with 
  a backdrop blur effect

SECTION 2 — EXHIBIT:
- A horizontal auto-scrolling section that starts 
  immediately after the hero with no gap
- Contains a bento grid of the hotel's best pictures 
  using images from Unsplash with hotel keywords
- The images must overflow vertically beyond the 
  section boundary so they are partially visible 
  when the user is still on the hero section, 
  creating a peek effect that invites scrolling
- The horizontal auto-scroll must be smooth and 
  continuous, pausing on hover
- Mix of portrait and landscape images in the 
  bento grid, varying sizes, no uniform grid

SECTION 3 — ACTIVITIES:
- Clean card section showing available hotel activities
- Each card: full bleed image, activity name in 
  Quicksand, short one-line description in General Sans, 
  duration and price, a minimal accent-colored CTA
- Cards in a 3 column grid on desktop, 1 column on mobile
- White background section with generous padding

SECTION 4 — CONTACT FORM:
- Minimal, generous whitespace
- Fields: full name, email, subject, message
- All fields have a bottom border only — no box borders
- Submit button full width, accent color background, 
  black text
- Section title in large Quicksand above the form

FOOTER:
- Dark background using #151316
- Three columns: hotel name + short tagline left, 
  navigation links center, social links and contact 
  info right
- A thin gray line above the footer
- Copyright line at the very bottom in small gray text

GLOBAL RULES:
- Fully responsive — mobile first
- No border radius anywhere except the reservation 
  bar inside the hero and the CTA buttons (4px max)
- Grainy texture applied to all gray UI elements 
  via SVG noise filter
- Generous whitespace throughout — minimum 120px 
  vertical padding per section on desktop
- No animations for now — focus on layout and design
- Use placeholder content for all text and activities
- All images use next/image with proper width, height 
  and alt attributes
- All components in /components folder, one file 
  per section
- No inline styles — Tailwind classes only