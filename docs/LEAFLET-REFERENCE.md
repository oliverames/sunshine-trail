# Leaflet.js Quick Reference for Sunshine Trail

This document provides Leaflet.js API references relevant to the Sunshine Trail project.

## Map Initialization & View Control

### setView
Sets the map view (center and zoom) with optional animation.
```javascript
map.setView([lat, lng], zoom, { animate: true });
```

### flyTo
Smooth pan-zoom animation to a location.
```javascript
map.flyTo([lat, lng], zoom);
```

### fitBounds
Fits the map to contain given bounds.
```javascript
map.fitBounds(bounds, { padding: [50, 50] });
```

### setZoomAround
Zooms while keeping a specific point stationary.
```javascript
map.setZoomAround(latlng, zoom);
```

## Markers & Popups

### Creating Markers
```javascript
const marker = L.marker([lat, lng], { icon: customIcon });
marker.addTo(map);
```

### Binding Popups
```javascript
marker.bindPopup("<b>Title</b><br>Description").openPopup();
```

### Custom Icons
```javascript
const icon = L.divIcon({
    className: 'custom-marker',
    html: '<div class="marker-content">Icon</div>',
    iconSize: [40, 40]
});
```

## Marker Clustering

The project uses [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster).

### Creating Cluster Group
```javascript
const markers = L.markerClusterGroup({
    disableClusteringAtZoom: 15,
    maxClusterRadius: 120,
    spiderfyOnMaxZoom: true
});
```

### Cluster Events
```javascript
markers.on('clusterclick', function(e) {
    // Handle cluster click
});

markers.on('click', function(e) {
    // Handle individual marker click
});
```

## Polylines (Route Display)

### Creating Polylines
```javascript
const route = L.polyline(coordinates, {
    color: '#3388ff',
    weight: 4,
    opacity: 0.8
});
route.addTo(map);
```

### Route Coordinates
The Sunshine Trail uses 85 waypoints to accurately follow:
- Blue Ridge Parkway (469 mi)
- Skyline Drive (105 mi)
- I-81 / US-7 Connector
- VT Route 100 (217 mi)

## Event Handling

### Map Events
```javascript
map.on('click', function(e) {
    console.log('Clicked at:', e.latlng);
});

map.on('zoomend', function() {
    console.log('Zoom level:', map.getZoom());
});

map.on('moveend', function() {
    console.log('Map moved');
});
```

### Popup Events
```javascript
marker.on('popupopen', function(e) {
    // Popup opened
});

marker.on('popupclose', function(e) {
    // Popup closed - restore previous view
});
```

## Controls

### Custom Controls
```javascript
const customControl = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function(map) {
        const container = L.DomUtil.create('div', 'custom-control');
        return container;
    }
});
map.addControl(new customControl());
```

### Zoom Control
```javascript
L.control.zoom({
    position: 'bottomright'
}).addTo(map);
```

## Distance Calculations

### Haversine Formula
Used for accurate geographic distance calculations:
```javascript
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
```

## Project-Specific Patterns

### Sidebar-Aware Bounds Fitting
```javascript
function fitBoundsWithSidebarOffset(bounds, options) {
    // Account for sidebar width on desktop
    const sidebarWidth = window.innerWidth > 768 ? 400 : 0;
    map.fitBounds(bounds, {
        ...options,
        paddingTopLeft: [sidebarWidth + 20, 20],
        paddingBottomRight: [20, 20]
    });
}
```

### Smart Popup Positioning
Logic to ensure popups are fully visible:
1. Wait for popup to render (50ms)
2. Get popup bounding rectangle
3. Check if popup top is above visible area
4. Pan map if needed to show full popup

## Resources

- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)
- [Leaflet Tutorials](https://leafletjs.com/examples.html)
