<h1 align="center">The Sunshine Trail</h1>

<p align="center">
  <strong>Mountain communities. Outdoor adventures. Cold beer.</strong>
</p>

<p align="center">
  <a href="https://thesunshinetrail.com"><img src="https://img.shields.io/badge/Live_Site-thesunshinetrail.com-f5a542?style=flat-square" alt="Live Site"></a>
  <a href="RIGHTS.md"><img src="https://img.shields.io/badge/reuse-all_rights_reserved-f5a542?style=flat-square" alt="All rights reserved"></a>
  <a href="https://www.buymeacoffee.com/oliverames"><img src="https://img.shields.io/badge/Buy_Me_a_Coffee-support-f5a542?style=flat-square&logo=buy-me-a-coffee&logoColor=white" alt="Buy Me a Coffee"></a>
</p>

An independent interactive map concept connecting Lawson's Finest Liquids from Waitsfield, Vermont to Asheville, North Carolina, a 791-mile route built around outdoor adventure and community organizations.

> "Explore the sunshine spots from Waitsfield, Vermont to Asheville, North Carolina. Discover retailers, hiking trails, river put-ins, and the community organizations we support along the way."

**Live Site:** [thesunshinetrail.com](https://thesunshinetrail.com)
**GitHub Pages:** [oliverames.github.io/sunshine-trail](https://oliverames.github.io/sunshine-trail/)

This project has received approval for its current use. I developed it independently and still operate the site. The repository is not open source; read [RIGHTS.md](RIGHTS.md) before reusing anything here.

---

## Project Overview

The Sunshine Trail is a campaign concept I developed for Lawson's Finest Liquids, a Vermont-based craft brewery known for their flagship Sip of Sunshine IPA and deep commitment to community impact. As Lawson's expands into the North Carolina and Virginia markets, this interactive experience visualizes that expansion not as a corporate rollout, but as **Vermont values traveling south**.

The map showcases the Lawson's locations I was able to identify, including breweries, tasting rooms, retailers, bars, and restaurants. It places them alongside hiking trails, river put-ins, community partners, and DC fast chargers on a scenic road trip route. Every element is designed to reinforce Lawson's brand promise: **"Finest. Freshest. Always Kept Cold."**

I created this outside the interview prompt because I wanted to show how I think about campaigns and brand storytelling. It is still a prototype, and the public site now labels modeled data and form behavior plainly.

---

## Strategic Foundation

### Why This Campaign?

Lawson's is in a phase where they're clearly focused on expanding their reach and reaching new markets. Beyond that, they are focused on **showing their impact, not telling about their impact**. With their expansion into the North Carolina and Virginia markets, they're reaching a new set of people and are at the soft launch phase.

One of the ideas I've had is to create a campaign that connects Lawson's from Waitsfield all the way to Asheville in North Carolina. This campaign addresses that challenge by:

1. **Showing impact through place**: the map puts community organizations beside the route rather than reducing them to a total.
2. **Connecting geography to values**: the trail links mountain communities that share an outdoor culture.
3. **Testing an inbound idea**: the prototype shows how a road trip guide could support a future, approved signup flow.

### Grounded in Lawson's Brand Identity

Every design decision in this project draws directly from Lawson's existing brand language:

**Visual Identity**

I studied Lawson's public website to understand its colors, type, iconography, spacing, and motion. The result is an independent concept, not an official brand implementation:

- **Colors** pulled directly from lawsonsfinest.com (including Lawson's yellow #f8e849 for Safari's tab bar via theme-color meta tags)
- **Typography** uses Lawson's brand fonts throughout
- **Custom iconography** based on assets published on their site
- **Corner radiuses, button styles, and spacing** all match Lawson's design system
- **The signature wave effect** on buttons, the little wiggle animation Lawson's uses on its website, appears on interactive elements throughout this site
- **Metadata** identifies Oliver Ames as the author and labels the project as an independent concept

**Brand Voice**
- "Mountain communities. Outdoor adventures. Cold beer.": active, place-based, confident without arrogance
- Community partner listings keep the organizations themselves in focus
- The site feels like a thoughtful host welcoming you to explore, not a marketer pushing product

**Core Brand Promises**
The three Easter eggs in the header each connect to a distinct Lawson's brand pillar:

| Easter Egg | Brand Connection |
|------------|------------------|
| **Sunshine word → God rays** | The Sip of Sunshine identity, warmth, positivity, the sun motif |
| **Cold Beer → Snowfall** | "Cold Stored. Cold Shipped. Cold Shelved." The snow connects to Lawson's promise to keep beer cold from brewing until it reaches the customer. |
| **Spinning sun logo → Emoji burst** | Playful whimsy that reflects the fun of craft beer culture without taking itself too seriously |

The idea of this site, more than just showing to the Lawson's folks that I understand their brand, is to figure out subtle, fun, whimsical ways to make aspects of the brand come alive without hitting you over the head with them.

---

## Features

### Header Interactions

There are essentially three Easter eggs in the header. These features are available on desktop and mobile, though they appear in different locations on mobile.

**The Sunshine Text**
Hovering over the word "Sunshine" generates beautiful sun rays that shoot out and cover the entire page. As the user moves their mouse, the center point of the sun kind of moves, creating a dynamic, full-viewport god ray effect.

**HDR Display Support:** On modern browsers with HDR-capable displays, the animation can push brightness beyond standard dynamic range. The brightest part of the "sun," directly under the mouse cursor, can use more of the display's peak brightness.

**The Sip of Sunshine Logo**
The famous Lawson's sun logo rotates very slowly by default. Users can:
- **Spin it** with a finger or mouse
- The sun has momentum, so it spins quickly and gradually slows down
- **Click it** to trigger a playful burst of sun, beer, ice cube, smiley face, and rainbow emoji

The rainbow emoji was intentionally included because I do think that Lawson's cares about DEI and LGBTQ+ rights, so I've included that there.

**Technical Note on the Fidget Sun:** The site has separate fidget suns in the header, password page, and modal. They share the same visual language and emoji vocabulary, while each interaction is tested in its actual page context.

**Cold Beer Text**
Hovering over "Cold Beer" triggers two effects:
- The whole page kind of gets this light blue filter over it
- Snow begins to fall across the page
- When you hover off of it, it goes away and kind of fades out

This connects to Lawson's "chain of freshness" brand promise, which emphasizes beer kept cold from brewing until it reaches the customer. The thaw effect takes 2.5 seconds to complete, with no new snowflakes appearing during the fade.

**Mobile Wind Effect:** On mobile devices, tilting the phone creates a "wind" effect. Smaller flakes drift more than larger ones, creating a playful physics simulation that rewards exploration.

**Snow Close Button (Mobile):** On mobile, a close button appears in the corner so visitors can dismiss the snowfall effect with a tap.

### Easter Egg Philosophy

All of the Easter eggs I've included in the site are not designed to get in the way. In fact, if you don't go looking for them, you might never find them. But they're all playing off different aspects of the brand.

Discovering things like "I can spin the sun" or "I can click it and little emojis fly out of it", that's a really fun little animation. That's a little bit of whimsy that you don't see on a lot of sites. But if you're just coming to this site to get the road trip map or whatever you want to do here, those things are not going to get in the way. They're somewhat hidden. That's the whole point of them being Easter eggs.

### Map Interface

**Modern Design Language**
I've tried to use modern design language. The sidebar is floating, with the map actually showing underneath the sidebar. So the sidebar is floating on top of the map.

**Custom Controls**
- Plus/minus zoom buttons use custom iconography SVGs pulled from the Lawson's website
- Search button matches the same design language
- "Zoom in for more detail" button features a pulsing or breathing yellow border that kind of breathes in and out, it's telling the user what they should do

**Location-Aware Zooming**
The page does not request location on load. If a visitor chooses the "zoom in for more detail" action, the browser can request location access and use it in the page to find the nearest mapped spot. The coordinates are not sent to this project.

After location has been granted, the plus button can guide later zoom steps toward that area instead of the geographic center of the full route.

**Search Functionality**
The search button allows you to search for any of the locations on the map. It displays them in a little list that matches the design language elsewhere on the site. Then you can click one and it'll zoom into the map to that location and open up the pin information about that location.

**Clustered Markers**
Since there are so many locations, I made these little pillboxes that contain the icons of each different type of business so that on zoom out, you weren't getting a bunch of icons overlapping each other. The pillboxes show:
- Icons for each category type present in that area
- How many of those types of locations are there (visible in the map key)
- Hover animation with the signature wave effect (see Visual Identity above)

**Clicking Clusters**
If I click on one of the pillboxes with all the locations, it'll zoom in to show me those locations. It'll zoom in as deep as it needs to to show those locations.

**Sidebar Scrolling**
The sidebar scrolls independently of the map. When you're on mobile, it scrolls just like you'd expect.

### Location Popups

Clicking any marker opens a popup showing:
- **Category tag** (e.g., "Community Partner")
- **Name** of the location
- **Description** with information about it
- **Google Maps link** styled in Lawson's sunshine gold with underline, brings you to navigation to their location
- **Learn More button** and **Donate button** that go to the respective pages on that community partner's website
- **Close button**

**Smart State Management**
There's interesting logic built in here: when you close the popup, the map actually goes back to the previous perspective before you opened the popup. I'm trying to make it super easy for folks to use and make the map and pins follow the kind of behavior you'd expect on a site like this.

**Image Sourcing**
The prototype mixes stock photography with images found on organization websites. The current project has received approval, but that approval does not give anyone else permission to republish the images. The source inventory remains useful for tracing where each image came from; see [RIGHTS.md](RIGHTS.md).

### Filter by Category

Eight filterable categories with Lawson's iconography:

| Category | Icon Source | Notes |
|----------|-------------|-------|
| Breweries | Lawson's purple brewery icon | Custom SVG from Lawson's site |
| Tasting Rooms | Sun icon | There's technically one tasting room, the HQ |
| Retailers | Two giant brewing tanks icon | Custom Lawson's SVG |
| Bars & Restaurants | Blue brewing tank with heart | Custom Lawson's SVG |
| Trails | Hiker icon | From Noun Project, uses Lawson's official green |
| River Put-Ins | Kayak icon | Uses Lawson's official blue |
| Community Partners | Lawson's logo | Organizations they donate to and partner with |
| DC Fast Chargers | Recycling icon with hop | That's a beer hop in the center |

**DC Fast Chargers Behavior**
The DC Fast Chargers shows as a category, but you can't select it until you've selected to see the road trip route.

**Hover States**
These buttons all work, and they have a hover state as you move over them.

**Loading Feedback**
When you toggle a filter, the checkbox is replaced with a loading spinner while the map updates, giving users immediate feedback that their action is being processed. This small detail prevents the confusion of wondering if the click registered.

**Community Partners by State**
Right underneath the categories, you can click "community partners by state" with options for: Vermont, New Hampshire, Maine, Massachusetts, Rhode Island, Connecticut, New York, New Jersey, Pennsylvania, Virginia, North Carolina.

When you mouse over these, you get the signature wave effect. When you click one of them, the map will zoom in to fit that view so you can see all of those locations in your state. As you click different ones, the map will zoom and pan and move around to the different locations. You can still click on them and learn about any of the individual ones in the popups and close those.

### Product Advertisement Section

Underneath the filters, I've put an example of a little advertisement spot. I found a PNG on their website of three of their [beers], and when you mouse over them they kind of come forward a little bit and add a drop shadow underneath. Clicking that will bring you to the correct page on the website.

Underneath that it says: **"Have a sip and learn more about our finest and freshest signature liquids, limited releases and taproom regulars"** with an **"Our Beers" button**.

### Illustrative Impact Widget

Four prototype metrics:
- **Modeled Dollars Raised**
- **Modeled Solar Generated**
- **B Impact Score**, linked to Lawson's B Corp listing
- **Nonprofits Supported**

**How the model works:**
I used published giving and solar figures as starting points, then modeled later values. The donations model assumes roughly 5% annual growth.

These are projections, not live reporting. The site says that directly. A production version would need approved source data and a real reporting feed.

I wanted it to feel live. That's why you can see it ticking up in real time.

**Visual Indicators**
The pulsing dot gives the section motion, while the heading and note identify the figures as illustrative.

**Why No Wave Effect Here**
These are the only buttons without the signature wave effect because the numbers already animate.

**Hover Interaction**
On desktop, the impact buttons lift slightly on hover instead of scaling.

**Semantic Structure**
The section uses the same heading hierarchy as the rest of the page.

### The Sunshine Trail Route

**Scenic Road Trip**
The Sunshine Trail Route is basically a road trip I put together from Asheville, North Carolina to Waitsfield, Vermont via some very scenic routes:
- **Blue Ridge Parkway** (469 miles)
- **Skyline Drive** (105 miles)
- **I-81 and US-7 Connector**
- **Vermont Route 100**

There's a little key that pops down showing the different sections of the trip with mileage.

**Making the Route Actually Follow the Roads**
I put in about 85 waypoints along the route so the line actually follows the scenic roads rather than cutting straight across the mountains. The Blue Ridge Parkway and Skyline Drive sections needed the most detail because they're so windy. And Vermont Route 100, I made sure the route follows that iconic scenic byway through the Green Mountains rather than defaulting to I-89 or something faster but boring.

**UX Consideration**
One of the things I was having trouble with is that when you click "show route on map, " it takes a second for it to load. It feels like the page hangs during that time.

Solution: I'm actually rendering a spinner, then toggling show route on map. Once that job has completed, the spinner goes away and the checkbox is checked. This gives the user the impression that something is happening. I'm really trying to make UX across this site that gives feedback to the user and kind of teaches them how to use it without having to show them.

**Route Display Behavior**
If I click "show route on map, " it will zoom the map out so that the map and trail fit within my viewport window. The route properly ends at Lawson's HQ in Waitsfield (not Stowe), emphasizing the destination.

**DC Fast Chargers**
When you click the "show route on map" button, you actually get an additional category displayed on the map: DC fast chargers along this route. I've put in a DC fast charger every 100 miles to 200 miles along the route. This is all part of the Green Promise of Lawson's.

### Signup Prototype Modal

**Trigger Points**
When you click "show route on map, " you also get a button underneath the key for the roadways that says "Get Itinerary." That pops up a window or a little modal, the rest of the site kind of dims and then this modal comes to the front.

What's really cool is if the user doesn't click "Get Itinerary" after about 30 seconds, this popup will come up anyway. This is part of an effective inbound strategy. The timer is visibility-aware, it pauses when the browser tab is in the background and resumes when the user returns, ensuring the popup appears at the right moment in the user's actual experience.

The modal is a user interface prototype. It does not join a newsletter, send an itinerary, store form values, request location access, or transmit submitted information. It includes:
- The interactive Lawson's sun (spin it, click it for emojis, same behavior as the header sun)
- Headline: **"Preview the Road Trip Signup"**
- A plain note that the form does not send or save information
- **Your Name** field
- **Your Email** field
- A manual town or city field for previewing a local-content option

**Call to Action**
The **"Preview Signup"** button uses the signature wave effect and confirms that nothing was sent or stored.

**Privacy Note**
The modal repeats that no signup occurs and nothing is transmitted.

There's also a close button that will hide the modal.

### About This Trail Section

At the end of the sidebar, there's an "About This Trail" section:

> "The Sunshine Trail celebrates the shared culture of mountain communities along the East Coast. From the Green Mountains of Vermont to the Blue Ridge of North Carolina, every spot on this map represents our commitment to quality, community, and the great outdoors."

### Footer

The sidebar has a simple footer with:
- The official Lawson's Finest logo
- "Visit lawsonsfinest.com" link (click to go to their website)
- Disclaimer: "This is a demonstration project not operated by or affiliated with Lawson's Finest Liquids"
- Copyright with my name

---

## Community Partner Concept

Community partner popups include a short description and direct links to the organization's website and donation page. Earlier drafts included unsourced first-person testimonials. Those were removed rather than presented as real quotes.

---

## Technical Implementation

### Built With
- **HTML5** with semantic structure (clear H1, H2, H3 hierarchy)
- **Leaflet.js** for mapping with marker clustering
- **CSS3** animations and transitions
- **Vanilla JavaScript** for all interactions
- **HTTPS** for security

### Responsive Design
- Mobile optimized, tablet optimized, responsive
- Sidebar repositions below map on narrow screens
- All Easter eggs work on touch devices (tap instead of hover), these features are available on mobile, just in different locations
- Touch events (touchstart, touchend) implemented alongside click handlers for full mobile compatibility
- Safe area concept ensures markers aren't hidden under UI elements
- Adaptive zoom levels based on viewport size

**Single Source of Truth for Breakpoints**
I got tired of hunting down hardcoded "768" values scattered throughout the code whenever I needed to adjust responsive behavior. So I created a `Viewport` utility object that serves as the single source of truth for all responsive checks. Instead of writing `window.innerWidth <= 768` everywhere, I now call `Viewport.isMobile()`. The actual breakpoint values live in `APP_CONFIG`, and there are matching CSS custom properties so the JavaScript and CSS always agree. It's a small thing, but it makes the code so much easier to maintain, change a breakpoint in one place and it updates everywhere.

### Privacy
The map asks for location only when a visitor chooses a location-aware map action. The signup prototype does not request location access, transmit form values, or store them.

### Making It Look Good When You Share It

The Open Graph and Twitter metadata label this as an independent campaign concept and identify Oliver Ames as the author.

I also added some structured data (JSON-LD) that helps search engines understand what the site is, basically telling them it's an interactive map experience connecting Vermont to North Carolina. Whether that actually helps with SEO, who knows, but it felt like the right thing to do.

### Hosting
- **GitHub Pages** with custom domain (thesunshinetrail.com)
- I purchased the custom domain, which is pretty cool, you can navigate to thesunshinetrail.com in any browser
- **Development workflow:** When I develop on my laptop, I'm not developing through GitHub Pages, I'm basically spooling up a local web development server and using that to test. Then when I feel like I've reached a good point, I push that up to GitHub and then GitHub renders the page for me so I can see

### Search Engine Optimization

The site implements comprehensive SEO best practices:

**Meta Tags**
- Descriptive title and meta description optimized for search
- Canonical URL to prevent duplicate content issues
- Geographic meta tags (geo.region, geo.placename, geo.position) for local search
- Mobile-friendly viewport configuration

**Open Graph & Twitter Cards**
- Open Graph and Twitter metadata for the independent concept
- Oliver Ames identified as the author
- No preview image is advertised until a cleared, correctly sized asset is available

**Structured Data (JSON-LD)**
- Schema.org WebSite, Person, WebPage, and TouristTrip types
- TouristTrip schema describing the road trip itinerary
- Proper entity relationships via @id references

**Technical SEO**
- Semantic HTML5 with proper heading hierarchy (H1 > H2 > H3)
- ARIA labels for accessibility and screen readers
- Descriptive alt text on images
- Clean URL structure

**Performance Factors**
- Resource preloading for critical assets
- DNS prefetch for external domains
- Lazy loading on below-fold images

---

## Content Sources

### Lawson's Locations
- Breweries and tasting room from official Lawson's sources
- Retailers, bars, and restaurants identified through research
- "All the Lawson's locations that I have been able to turn up as well as some additional stuff along the way"

### Community Partners
Organizations selected to align with Lawson's brand values, clean water, healthy earth, community support:
- **Food security** (Vermont Foodbank, MANNA FoodBank)
- **Watershed/river protection** (James River Association, French Broad Riverkeeper)
- **Trail conservation** (Green Mountain Club, Blue Ridge Parkway Foundation)
- **Local community organizations** across the distribution footprint

### Outdoor Locations
- Hiking trails along the Appalachian corridor
- River put-ins for paddling access
- Selected for their connection to the outdoor lifestyle central to Lawson's identity

---

## Campaign Potential

### "Vermont values, traveling south"

The Sunshine Trail reframes geographic expansion as values expansion:

> "From Vermont Foodbank to MANNA FoodBank. From the Mad River to the French Broad. Same mission, growing geography."

### Partnership Opportunities
- **Blue Ridge Parkway Foundation**: "Pints for the Parkway" events
- **Regional food banks**: parallel giving campaigns in new markets
- **Watershed organizations**: clean water connects to the brewing process

### Future Newsletter Segmentation
An approved production form could use a visitor-provided town or city for geo-targeted content:
- North Carolina subscribers hear about MANNA FoodBank
- Vermont subscribers hear about Vermont Foodbank
- Each region feels locally relevant

---

## Additional Details Worth Mentioning

There are a bunch of smaller decisions I made throughout building this that I think show attention to detail:

### Protecting the Content
Since I'm pulling in brand assets, impact stories, and curated content, I wanted to make sure people couldn't just copy everything off the page. So I added some light copy protection, but I made sure it still lets users copy text they're typing into form fields, because that would be annoying otherwise.

### Making the Animations Feel Right
The snowfall effect took some tweaking to get right. I wanted it to feel like continuous, natural snowfall rather than waves of snowflakes all falling at the same time. So each snowflake has its own random fall duration. I also had an issue where if you hovered in and out of "Cold Beer" really quickly, the animation would kind of crash and restart, that's fixed now, it handles rapid transitions smoothly.

### Keeping Buttons Consistent
The yellow call-to-action buttons (Get Itinerary, Preview Signup, Our Beers) use the signature wave effect on hover. I wanted them to feel consistent with each other and with Lawson's website.

### Little UX Things That Matter
- The "Zoom for detail" button stays visible until you actually interact with the zoom controls yourself, it doesn't disappear just because the map moved automatically
- On mobile, when you select a state filter, the page automatically scrolls up so you can see the map, otherwise you'd click something and nothing would seem to happen
- Only one popup can be open at a time, and when you close it, the map goes back to where you were before
- When you click a pin, the map centers on both the pin and the popup together, so you can actually see both

### Making Mobile Actually Work Well

I put a lot of effort into making the mobile experience feel native and intuitive rather than just "the desktop site shrunk down."

**The Map Shows the Route Right Away**
When you first load the page, the scenic road trip route is already displayed. I figured that's probably what most people are coming here for, so why make them hunt for it?

**Balanced Map and Content Split**
On mobile, the map takes up exactly half the screen. This way you can see both the map and the sidebar content without having to scroll back and forth constantly. It's a small thing but it makes a big difference.

**Search That Actually Works on a Phone**
When you tap the search button on mobile, the search input expands to fill the whole width of the map area. Trying to type into a tiny search box on a phone is frustrating, so I made it bigger.

**A Little Floating Arrow to Help Navigate**
There's a floating arrow button in the corner on mobile that helps you navigate the page. It points down when you're at the top (tap to scroll to content) and flips to point up when you're at the bottom (tap to scroll back to map). It even bounces a little to get your attention, and changes color when it's over the yellow Live Impact section so you can still see it.

**"Tap for More" Button When Map is Expanded**
When the map expands to show a popup or search results, the floating arrow transforms into a centered "Tap for More" button. This gives users an obvious way to collapse the map and see the rest of the page content. The button:
- Smoothly animates from the corner position to center-bottom
- Shows "Tap for More" text with a downward-pointing arrow (indicating "tap to see content below")
- Collapses the map when tapped and scrolls to the sidebar content
- Morphs back into the corner arrow button when the map collapses
- Uses the same wave text animation on hover as the "Our Beers" button, characters animate right-to-left with a subtle bounce
- Has a slightly translucent background (92% opacity) for visual polish
- Only appears after the map has expanded at least once (not visible on initial page load)
- Collapses back to the arrow when the user scrolls the sidebar (but not when scrolling/panning the map)

This transformation uses GPU-accelerated CSS animations (transforms and opacity only) for smooth 60fps performance even on older devices. The implementation includes full accessibility support with `aria-expanded`, `aria-controls`, live region announcements for screen readers, and keyboard navigation (Enter/Space).

**Scroll Indicator Test Coverage** (`tests/scroll-indicator.spec.ts`)
The "Tap for More" feature has comprehensive Playwright tests with video recording for animation review:
- Basic functionality tests (visibility on mobile, ARIA attributes)
- Map expansion transform tests (button morphing, arrow direction verification)
- Collapse behavior tests (clicking the button collapses map and scrolls)
- Keyboard accessibility tests (Enter and Space key support)
- Animation recording tests (full expand/collapse cycle captured on video)
- Screen reader accessibility tests (live region, accessible names)

**The Email Popup Goes Full Screen**
On mobile, when the email signup modal appears, it covers the whole screen. This keeps you focused on signing up without distractions.

**No Fake Hover States on Touch**
On phones, I removed the hover effects from the Live Impact buttons because they would trigger accidentally while scrolling. Instead, they respond to actual taps.

**The Beer Cans Animate When You See Them**
Since you can't hover on mobile, the beer cans image automatically does its little "come forward" animation when it scrolls into view. It's a nice way to draw attention to the CTA without requiring hover.

**Map Expands When You Need More Room**
This one's pretty cool, on mobile, when you tap a marker or open search, the map automatically expands to fill more of the screen so you have room to see the popup or search results. When you close the popup or dismiss search, it shrinks back down. When expanded, the scroll indicator transforms into a centered "Tap for More" button (described above), giving users an obvious exit point to collapse the map and explore the sidebar content.

### Some Technical Stuff Under the Hood

A few things that aren't visible but make the site work better:

- **Getting distances right**: When the site finds "the nearest location to you," it uses the Haversine formula rather than treating latitude and longitude like a flat grid.

- **Keeping things snappy**: Animations, timers, and event listeners are cleaned up when the visitor leaves the page.

- **Handling fast clicks**: Guards prevent state filters from firing twice or conflicting with each other.

- **Marker clustering that makes sense**: Individual markers begin appearing around city level, before a visitor has to zoom all the way to street level.

### Testing

I built out a pretty comprehensive test suite to make sure everything actually works. It covers all the main features, the password protection, the Easter eggs, map interactions, popups, search, filters, the email modal, the live metrics, basically everything.

And because responsive design is such a big part of this, I test across 15 different screen sizes: five mobile sizes (from iPhone SE all the way up to iPhone 14 Pro Max), four tablet sizes (iPad Mini through iPad Pro), and six desktop sizes (from small laptops up to ultrawide monitors).

GitHub Actions runs the maintained feature suites on a representative phone, tablet, and desktop profile for every change. The remaining viewport projects stay available for deeper local checks.

The tests verify that things like the route display, scroll indicator, search expansion, and hover states all work correctly at every breakpoint. It's probably overkill for a demo project, but I wanted to make sure it actually worked well everywhere.

**Test Quality Improvements**
I recently went through and cleaned up all the placeholder assertions in the test suite. You know those `expect(true).toBe(true)` patterns that developers sometimes write when they're in a hurry? I had a bunch of those. They were basically saying "the test ran without crashing" rather than actually verifying the behavior. I replaced them all with meaningful assertions, checking that elements are actually visible, that state changes happened correctly, that the page remains functional after interactions. The tests are much more useful now for catching actual regressions.

---

## Project Status

The prototype is stable enough to demonstrate, but it is not cleared for production or third-party reuse.

**What would change for production:**
- Approved data feeds for impact metrics
- Official Lawson's form integration for email capture
- Additional verified locations from Lawson's distribution database
- Written clearance or replacement for third-party assets
- A factual and legal review of campaign copy

### Presentation Mode

For my interview demo, I added a password-protected overlay so I can control when people see the site. When you first visit, you see a Lawson's yellow branded gate with a password field. Enter the right password and you get a little "Welcome" animation before the full experience reveals itself. Once you're in, refreshing doesn't kick you out, it remembers for your session.

The password page also has the interactive sun, something to fidget with while entering the password. It's sized appropriately for each screen size (smaller on phones, bigger on desktops).

And I made sure the overlay actually locks the page properly, you can't scroll or drag behind it to sneak a peek at the content before you're authenticated.

---

## About This Project

The Sunshine Trail was built by [Oliver Ames](https://github.com/oliverames) as a demonstration of campaign thinking, brand alignment, and technical execution for the Digital Marketing Manager position at Lawson's Finest Liquids.

> "The idea of this site, more than just showing to the Lawson's folks that I understand their brand, is to figure out subtle, fun, whimsical ways to make aspects of the brand come alive without hitting you over the head with them."

---

## Disclaimer

This is a demonstration project not operated by or affiliated with Lawson's Finest Liquids. No open source license is granted. See [RIGHTS.md](RIGHTS.md) for the reuse boundary.

---

<p align="center">
  <a href="https://www.buymeacoffee.com/oliverames">
    <img src="https://img.shields.io/badge/Buy_Me_a_Coffee-support-f5a542?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white" alt="Buy Me a Coffee">
  </a>
</p>

<p align="center">
  <sub>
    Built by <a href="https://ames.consulting">Oliver Ames</a> in Vermont
    &bull; <a href="https://github.com/oliverames">GitHub</a>
    &bull; <a href="https://linkedin.com/in/oliverames">LinkedIn</a>
    &bull; <a href="https://bsky.app/profile/oliverames.bsky.social">Bluesky</a>
  </sub>
</p>
