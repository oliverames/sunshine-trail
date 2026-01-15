# The Sunshine Trail

**Mountain communities. Outdoor adventures. Cold beer.**

An interactive microsite built as a conceptual campaign for Lawson's Finest Liquids—a digital map experience connecting Waitsfield, Vermont to Asheville, North Carolina across 791 miles of shared culture, outdoor adventure, and community impact.

> "Explore the sunshine spots from Waitsfield, Vermont to Asheville, North Carolina. Discover retailers, hiking trails, river put-ins, and the community organizations we support along the way."

**Live Site:** [thesunshinetrail.com](https://thesunshinetrail.com)
**GitHub Pages:** [oliverames.github.io/sunshine-trail](https://oliverames.github.io/sunshine-trail/)

---

## Project Overview

The Sunshine Trail is a campaign concept I developed independently for Lawson's Finest Liquids, a Vermont-based craft brewery known for their flagship Sip of Sunshine IPA and deep commitment to community impact. This wasn't part of the prompt I was given for my interview—it's something I cooked up on my own because I wanted to demonstrate how I think about campaigns and brand storytelling.

As Lawson's expands into the North Carolina and Virginia markets, this interactive experience visualizes that expansion not as a corporate rollout, but as **Vermont values traveling south**.

The map showcases all Lawson's locations I was able to identify—breweries, tasting rooms, retailers, bars, and restaurants—alongside hiking trails, river put-ins, community partners, and DC fast chargers along a scenic road trip route. Every element is designed to reinforce Lawson's brand promise: **"Finest. Freshest. Always Kept Cold."**

---

## Strategic Foundation

### Why This Campaign?

Lawson's is focused on expanding their reach while **showing their impact, not telling about it**. This campaign addresses that challenge by:

1. **Showing impact, not telling** — Rather than listing donation numbers, the map features individual community partners with real impact stories
2. **Connecting geography to values** — The trail physically connects mountain communities that share the same outdoor culture
3. **Creating an inbound marketing asset** — The road trip concept provides a natural email capture opportunity with genuine value exchange

### Grounded in Lawson's Brand Identity

Every design decision draws directly from Lawson's existing brand language:

**Visual Identity**
- Colors, typography, and iconography extracted from lawsonsfinest.com using web inspector tools
- Corner radiuses, button styles, and spacing match Lawson's design system
- Favicon and meta tags mirror the main website for consistent link sharing

**Brand Voice**
- Active, place-based, confident without arrogance
- Impact stories focus on the humans doing the work, with Lawson's as enabler rather than hero
- The site feels like a thoughtful host welcoming you to explore

**Core Brand Promises**
The three Easter eggs in the header each connect to a distinct Lawson's brand pillar:

| Easter Egg | Brand Connection |
|------------|------------------|
| **Sunshine word → God rays** | The Sip of Sunshine identity—warmth, positivity, the sun motif |
| **Cold Beer → Snowfall** | "Cold Stored. Cold Shipped. Cold Shelved."—the chain of freshness |
| **Spinning sun logo → Emoji burst** | Playful whimsy that reflects craft beer culture |

The goal is to make aspects of the brand come alive in subtle, fun ways without hitting you over the head with them.

---

## Features

### Header Interactions

Three Easter eggs available on desktop and mobile (different locations on mobile). They're designed not to get in the way—if you don't go looking for them, you might never find them.

**The Sunshine Text**
Hovering generates dynamic, full-viewport god rays that follow the cursor.

**HDR Display Support:** On modern browsers with HDR-capable displays, the animation pushes brightness beyond standard dynamic range—up to 1600 nits peak brightness—making the sun genuinely feel bright.

**The Sip of Sunshine Logo**
- Rotates slowly by default
- Users can spin it with momentum (it has weight and gradually slows)
- Click to trigger emoji bursts (sun, beer, ice cube, smiley faces, rainbow—the rainbow intentionally included for DEI/LGBTQ+ support)

**Cold Beer Text**
Hovering triggers a light blue filter and snowfall effect, connecting to Lawson's "chain of freshness" promise.

### Map Interface

**Modern Design Language**
Floating sidebar with map visible underneath. Custom plus/minus zoom buttons and search use Lawson's iconography.

**Location-Aware Zooming**
The browser requests location (completely private—not passed anywhere). The plus button zooms toward your region rather than map center. The "Zoom in for more detail" button zooms to your location, ensuring a Lawson's location is nearby.

**Search Functionality**
Search for any location, displayed in a styled list. Click to zoom and open the pin popup.

**Clustered Markers**
Pillbox clusters show category icons and counts to prevent overlap at zoom out. Hover triggers a wave animation (matching Lawson's website). All buttons across the site use this same wave effect for brand consistency. Clicking clusters zooms to show individual locations.

**Sidebar Scrolling**
Scrolls independently of the map on all devices.

### Location Popups

Clicking any marker shows:
- Category tag, name, and description
- Google Maps navigation link
- Impact story (for community partners)
- Learn More and Donate buttons
- Close button

**Smart State Management:** Closing a popup returns to the previous map perspective.

**Image Sourcing:** Images pulled from organization websites, with Unsplash fallbacks.

### Filter by Category

Eight filterable categories with Lawson's iconography:

| Category | Icon Source |
|----------|-------------|
| Breweries | Lawson's purple brewery icon (custom SVG) |
| Tasting Rooms | Sun icon |
| Retailers | Beer brewing tanks icon (custom SVG) |
| Bars & Restaurants | Blue tank with heart (custom SVG) |
| Trails | Hiker icon (Noun Project, Lawson's green) |
| River Put-Ins | Kayak icon (Lawson's blue) |
| Community Partners | Lawson's logo |
| DC Fast Chargers | Recycling icon with hop (unlocks with route) |

**Community Partners by State:** Click state names to zoom the map to that state's locations.

### Product Advertisement Section

Beer PNG with hover effect linking to the website. CTA: "Have a sip and learn more about our finest and freshest signature liquids, limited releases and taproom regulars."

### Live Impact Widget

Four real-time metrics ticking up continuously:
- **Dollars Raised** (with ~5% YoY growth projection)
- **Solar Generated**
- **B Impact Score** (links to B Corp listing)
- **Nonprofits Supported**

Based on historical Lawson's data projected five years out. Green pulsing dot indicates live status. No wave effect here since the numbers themselves animate.

### The Sunshine Trail Route

Scenic road trip from Asheville to Waitsfield:
- **Blue Ridge Parkway** (469 miles)
- **Skyline Drive** (105 miles)
- **I-81 and US-7 Connector**
- **Vermont Route 100**

Loading spinner provides UX feedback during route rendering. Route display zooms to fit the viewport. DC fast chargers appear every 100-200 miles along the route (part of Lawson's Green Promise).

### Email Capture Modal

**Triggers:** "Get Itinerary" button or auto-popup after 30 seconds (effective inbound strategy).

**Contents:**
- Spinning Lawson's Sun (interactive)
- "Get your free road trip guide" headline
- Name and email fields with matching design language
- "Send me info about local happenings" button auto-detects location (town name only, not GPS)
- Privacy note: "By signing up, you'll join the Lawson's Finest newsletter. Unsubscribe anytime."

The form actually works—it uses the actual Lawson's web form.

### About This Trail & Footer

About section quote celebrating shared mountain community culture. Footer includes Lawson's logo, website link, demonstration disclaimer, and copyright.

---

## Showing Impact Through Stories

### Vermont Food Bank Example

- **Image** and **Community Partner** tag
- **Description:** "Vermont's largest hunger relief organization serving all 14 counties"
- **Impact Story:** "Thanks to support from Lawson's Cosmic Shift IPA, families like the Martins in rural Vermont can count on fresh produce and protein each week."
- **Learn More** and **Donate** buttons

### James River Association Example

Selected because clean water connects to the brewing process—part of Lawson's brand promise:
- **Description:** "Protecting Virginia's historic James River watershed since 1976"
- **Testimonial:** "I never knew Richmond had such an amazing river until the James River Association showed me. Now I'm a volunteer river cleaner."

---

## Technical Implementation

### Built With
- **HTML5** with semantic structure (H1, H2, H3 hierarchy)
- **Leaflet.js** for mapping with marker clustering
- **CSS3** animations and transitions
- **Vanilla JavaScript** for all interactions
- **HTTPS** for security

### Responsive Design
- Mobile and tablet optimized
- Sidebar repositions below map on narrow screens
- Touch events implemented alongside click handlers
- Safe area concept ensures markers aren't hidden under UI elements
- Adaptive zoom levels based on viewport size

### Privacy
Location data is completely private—never passed anywhere unless explicitly entered in the signup form.

### Hosting
GitHub Pages with custom domain (thesunshinetrail.com). Local development server for testing, then push to GitHub for deployment.

---

## Content Sources

### Lawson's Locations
Breweries and tasting room from official sources; retailers, bars, and restaurants identified through research.

### Community Partners
Organizations selected to align with Lawson's brand values:
- **Food security** (Vermont Foodbank, MANNA FoodBank)
- **Watershed/river protection** (James River Association, French Broad Riverkeeper)
- **Trail conservation** (Green Mountain Club, Blue Ridge Parkway Foundation)
- **Local community organizations** across the distribution footprint

### Outdoor Locations
Hiking trails and river put-ins along the Appalachian corridor, selected for connection to outdoor lifestyle.

---

## Campaign Potential

### "Vermont values, traveling south"

> "From Vermont Foodbank to MANNA FoodBank. From the Mad River to the French Broad. Same mission, growing geography."

### Partnership Opportunities
- **Blue Ridge Parkway Foundation** — "Pints for the Parkway" events
- **Regional food banks** — Parallel giving campaigns in new markets
- **Watershed organizations** — Clean water connects to brewing

### Newsletter Segmentation
Location capture enables geo-targeted content—each region feels locally relevant.

---

## Strategic Decision Points

### Content Protection
Copy protection via CSS and JavaScript protects brand assets while allowing form field input.

### Animation & Performance
- Variable snowflake durations create natural falling patterns
- GPU-accelerated animations for smooth 60fps

### UX Guardrails
- Zoom hint persists until user interacts with zoom/search
- Auto-scroll on mobile when selecting state filters
- Single popup at a time with auto-close
- Standardized hover states across all CTAs

### Mobile-First UX Improvements

**Route Display by Default**
The scenic road trip route now displays automatically on page load, giving users immediate context about the Sunshine Trail journey from Asheville, NC to Waitsfield, VT. The route properly ends at Lawson's HQ in Waitsfield (not Stowe), emphasizing the destination.

**Half-Viewport Map (Mobile)**
On mobile devices, the map occupies exactly 50% of the viewport height, creating a balanced split between the interactive map and scrollable content below. This ensures users see both the map and the filter/content sidebar without excessive scrolling.

**Full-Width Search Expansion (Mobile)**
When activated on mobile, the search input expands to cover the full width of the map area, making it much easier to type and view search results on smaller screens. Results display in a dropdown that fits within the map height.

**Floating Scroll Indicator (Mobile)**
A floating arrow button appears in the lower-right corner on mobile devices:
- Points down when in the top half of the page (scrolls to bottom)
- Flips to point up when past the halfway point (scrolls to top)
- Bounces periodically to draw attention
- Styled consistently with the search button
- Z-indexed below sun rays and snowfall effects

**Email Popup Timing**
The email capture modal now triggers 30 seconds after page load (rather than after route interaction), following inbound marketing best practices for engagement without being intrusive.

**Full-Viewport Email Modal (Mobile)**
On mobile devices, the email signup modal covers the full viewport for a focused, distraction-free signup experience.

**Touch-Optimized Hover States (Mobile)**
Live Impact metric buttons no longer have hover states on touch devices, preventing false triggers during scroll. Active states provide feedback on actual taps instead.

**Beer Section Image Animation (Mobile)**
The beer cans image automatically animates to its "hover" state when fully visible in the viewport, and returns to normal when scrolling away. This brings attention to the CTA without requiring hover interaction.

**Snowfall Animation Stability**
Fixed an issue where hovering in/out of "Cold beer" quickly could cause the snowfall animation to crash and restart. The animation now handles rapid hover transitions smoothly by properly managing cleanup timeouts and thawing snowflake states.

### Quality Assurance
Playwright test suite covers zoom hints, search, map views, copy protection, and all UX improvements across nine viewport breakpoints:

| Category | Size | Width |
|----------|------|-------|
| Mobile | Small | 320px |
| Mobile | Medium | 375px |
| Mobile | Large | 428px |
| Tablet | Small | 768px |
| Tablet | Medium | 820px |
| Tablet | Large | 1024px |
| Desktop | Small | 1280px |
| Desktop | Medium | 1440px |
| Desktop | Large | 1920px |

Tests verify route display, scroll indicator behavior, search expansion, hover states, snowflake animation smoothness, and email popup timing across all breakpoints.

---

## Project Status

This is a demonstration project for a job interview—not operated by or affiliated with Lawson's Finest Liquids.

**What would change for production:**
- Real data feeds for live impact metrics
- Official Lawson's form integration
- Additional verified locations from Lawson's distribution database
- Content approval workflow for impact stories

---

## About This Project

Built by [Oliver Ames](https://github.com/oliverames) as a demonstration of campaign thinking, brand alignment, and technical execution for the Digital Marketing Manager position at Lawson's Finest Liquids.

---

## Disclaimer

This is a demonstration project not operated by or affiliated with Lawson's Finest Liquids.

© 2026 Oliver Ames
