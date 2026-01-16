/**
 * Sunshine Trail E2E Test Selectors
 *
 * Centralized selectors for all interactive elements.
 * Using data attributes, IDs, and semantic selectors for resilience.
 */

export const selectors = {
  // ═══════════════════════════════════════════════════════════════
  // PASSWORD OVERLAY
  // ═══════════════════════════════════════════════════════════════
  password: {
    overlay: '#password-overlay',
    input: '#password-input',
    submitButton: '#password-submit',
    errorMessage: '#password-error',
    content: '#password-content',
    fidgetSun: '#fidget-sun-password',
  },

  // ═══════════════════════════════════════════════════════════════
  // HEADER & EASTER EGGS
  // ═══════════════════════════════════════════════════════════════
  header: {
    title: 'header h1',
    sunshineSpan: 'header h1 span', // Triggers god rays on hover
    tagline: 'header .tagline',
    coldBeerSpan: 'header .cold-beer', // Triggers snowfall on hover
    fidgetSun: '#fidget-sun', // Main header sun spinner
    fidgetSunSidebar: '#fidget-sun-sidebar',
    fidgetSunFooter: '#fidget-sun-footer',
    fidgetSunModal: '#fidget-sun-modal',
  },

  // ═══════════════════════════════════════════════════════════════
  // EASTER EGG EFFECTS
  // ═══════════════════════════════════════════════════════════════
  effects: {
    godRays: '#god-rays-glow',
    snowflakes: '.snowflake',
    emojiBurst: '.emoji-burst',
    freezeOverlay: '#freeze-overlay',
  },

  // ═══════════════════════════════════════════════════════════════
  // SIDEBAR
  // ═══════════════════════════════════════════════════════════════
  sidebar: {
    container: '.sidebar',
    introText: '.intro-text',
  },

  // ═══════════════════════════════════════════════════════════════
  // LIVE METRICS
  // ═══════════════════════════════════════════════════════════════
  metrics: {
    section: '.metrics-section',
    donationsCounter: '#donations-counter',
    solarCounter: '#solar-counter',
    bCorpScore: '#metric-bcorp .metric-number',
    nonprofitsCount: '#metric-nonprofits .metric-number',
    liveDot: '.live-dot',
  },

  // ═══════════════════════════════════════════════════════════════
  // ROUTE SECTION
  // ═══════════════════════════════════════════════════════════════
  route: {
    toggleContainer: '#route-toggle-container',
    toggleCheckbox: '#toggle-scenic-route',
    legend: '#route-legend',
    itineraryButton: '#get-itinerary-btn',
    blueRidgeLine: '.route-line.blue-ridge',
    skylineLine: '.route-line.skyline',
    connectorLine: '.route-line.connector',
    route100Line: '.route-line.route-100',
  },

  // ═══════════════════════════════════════════════════════════════
  // CATEGORY FILTERS
  // ═══════════════════════════════════════════════════════════════
  filters: {
    section: '.filter-section',
    breweries: '#filter-breweries',
    tastingRooms: '#filter-tastingrooms',
    retailers: '#filter-retailers',
    bars: '#filter-bars',
    trails: '#filter-trails',
    rivers: '#filter-rivers',
    community: '#filter-community',
    chargers: '#filter-chargers',
    // Count badges
    countBreweries: '#count-breweries',
    countTastingRooms: '#count-tastingrooms',
    countRetailers: '#count-retailers',
    countBars: '#count-bars',
    countTrails: '#count-trails',
    countRivers: '#count-rivers',
    countCommunity: '#count-community',
    countChargers: '#count-chargers',
  },

  // ═══════════════════════════════════════════════════════════════
  // STATE FILTERS
  // ═══════════════════════════════════════════════════════════════
  stateFilters: {
    section: '.state-filter-section',
    allStates: '.state-btn.all-states',
    buttonByState: (state: string) => `.state-btn[data-state="${state}"]`,
    activeButton: '.state-btn.active',
  },

  // ═══════════════════════════════════════════════════════════════
  // MAP
  // ═══════════════════════════════════════════════════════════════
  map: {
    container: '#map',
    zoomHint: '#zoom-hint',
    searchControl: '#map-search-control',
    searchInput: '#map-search-input',
    searchButton: '#map-search-btn',
    searchResults: '#map-search-results',
    // Leaflet elements
    markerCluster: '.marker-cluster-pill',
    marker: '.leaflet-marker-icon:not(.marker-cluster-pill)',
    popup: '.leaflet-popup',
    popupContent: '.leaflet-popup-content',
    popupCloseButton: '.leaflet-popup-close-button',
    zoomInButton: '.leaflet-control-zoom-in',
    zoomOutButton: '.leaflet-control-zoom-out',
    // Route polylines
    polyline: '.leaflet-interactive',
  },

  // ═══════════════════════════════════════════════════════════════
  // EMAIL MODAL
  // ═══════════════════════════════════════════════════════════════
  emailModal: {
    overlay: '#email-modal',
    closeButton: '#email-modal-close',
    form: '#email-form',
    nameInput: '#name-input',
    emailInput: '#email-input',
    localCheckbox: '#local-checkbox',
    locationField: '#location-field',
    locationInput: '#location-input',
    submitButton: '.email-submit',
  },

  // ═══════════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════════
  footer: {
    container: 'footer.bottom-brand',
    brandLink: '.bottom-brand-link',
    disclaimer: 'footer .demo-disclaimer',
  },
} as const;

/**
 * State abbreviations for state filter tests
 */
export const STATES = ['VT', 'NH', 'ME', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'VA', 'NC'] as const;

/**
 * Category filter IDs mapped to their labels
 */
export const CATEGORY_FILTERS = {
  breweries: 'Breweries',
  tastingrooms: 'Tasting Rooms',
  retailers: 'Retailers',
  bars: 'Bars & Restaurants',
  trails: 'Trails',
  rivers: 'River Put-ins',
  community: 'Community Partners',
  chargers: 'DC Fast Chargers',
} as const;

/**
 * Password for the demo site
 */
export const DEMO_PASSWORD = 'hireme';
