import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as maplibregl from 'maplibre-gl';

const TYPE_CLASSES = {
  'plot setting':       'plot-setting',
  'author connection':  'author-connection',
  'inspiration':        'inspiration',
  'historical':         'historical',
};

function normalizeType(type) {
  if (!type) return 'plot-setting';
  const lower = type.toLowerCase().replace(/_/g, ' ');
  return TYPE_CLASSES[lower] || 'plot-setting';
}

function buildPopupHTML(loc) {
  const typeClass = normalizeType(loc.type);
  return `
    <div class="popup-name">${loc.name}</div>
    <span class="popup-type-badge ${typeClass}">${loc.type || 'Plot Setting'}</span>
    ${loc.significance ? `<p class="popup-significance">${loc.significance}</p>` : ''}
    ${loc.trivia ? `<div class="popup-trivia">${loc.trivia}</div>` : ''}
    ${loc.quote ? `<div class="popup-quote">"${loc.quote}"</div>` : ''}
  `;
}

const MapView = forwardRef(function MapView({ locations }, ref) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Close all open popups except the one at the given index (-1 = close all)
  function closeAllPopups(exceptIndex = -1) {
    markersRef.current.forEach((m, i) => {
      if (i !== exceptIndex && m.getPopup()?.isOpen()) {
        m.getPopup().remove();
      }
    });
  }

  // Initialize map on mount
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          }
        },
        layers: [
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 20
          }
        ]
      },
      center: [20, 30], // World literary view
      zoom: 2.5,
      attributionControl: false,
    });

    mapRef.current.on('load', () => {
      // Inject a custom, permanent label for Palestine over the map
      if (!mapRef.current.getSource('custom-labels')) {
        mapRef.current.addSource('custom-labels', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [34.9, 30.85] // Shifted south to perfectly cover the Carto label
                },
                properties: {
                  title: 'Palestine'
                }
              }
            ]
          }
        });

        mapRef.current.addLayer({
          id: 'custom-labels-layer',
          type: 'symbol',
          source: 'custom-labels',
          maxzoom: 9,
          layout: {
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
            'text-size': [
              'interpolate', ['linear'], ['zoom'],
              3, 8,
              5, 10,
              8, 14
            ],
            'text-letter-spacing': 0.1,
            'text-transform': 'uppercase'
          },
          paint: {
            'text-color': '#5c5c5c', // Match the dark grey of EGYPT
            'text-halo-color': '#111111', // Match the landmass
            'text-halo-width': [
              'interpolate', ['linear'], ['zoom'],
              3, 4,
              5, 6,
              8, 10
            ],
            'text-halo-blur': 1
          }
        });
      }
    });

    mapRef.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-left'
    );

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!locations || locations.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    locations.forEach((loc, i) => {
      if (!loc.lat || !loc.lng) return;

      // Build Snapchat-style floating pin
      const el = document.createElement('div');
      el.className = `snap-pin ${normalizeType(loc.type)}`;
      el.style.animationDelay = `${i * 100}ms`;

      // Short display name (city only, strip country)
      const shortName = loc.name.split(',')[0].trim();

      el.innerHTML = `
        <div class="snap-pin-label">${shortName}</div>
        <div class="snap-pin-dot"></div>
      `;

      // Define specific offsets based on which direction the popup opens
      const popupOffsets = {
        'bottom': [0, -50], // popup sits above marker, move UP 50px to clear the label
        'top': [0, 10],     // popup sits below marker, move DOWN 10px
        'left': [20, -20],  // popup sits right of marker
        'right': [-20, -20], // popup sits left of marker
        'bottom-left': [10, -50],
        'bottom-right': [-10, -50],
        'top-left': [10, 10],
        'top-right': [-10, 10]
      };

      const popup = new maplibregl.Popup({
        offset: popupOffsets,
        maxWidth: '360px',
        closeButton: true,
      }).setHTML(buildPopupHTML(loc));

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([loc.lng, loc.lat])
        .setPopup(popup)
        .addTo(mapRef.current);

      // Close all other popups when this one opens
      el.addEventListener('click', () => {
        closeAllPopups(i);
      });

      markersRef.current.push(marker);
      bounds.extend([loc.lng, loc.lat]);
    });

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, {
        padding: { top: 100, bottom: 60, left: 60, right: 60 },
        maxZoom: 12,
        duration: 1200,
      });
    }
  }, [locations]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    flyToLocation(lat, lng) {
      mapRef.current?.flyTo({
        center: [lng, lat],
        zoom: 10,
        duration: 1500,
      });
    },
    openPopupAt(index) {
      const marker = markersRef.current[index];
      if (marker) {
        closeAllPopups(index);
        if (!marker.getPopup()?.isOpen()) {
          marker.togglePopup();
        }
        const lngLat = marker.getLngLat();
        mapRef.current?.flyTo({
          center: [lngLat.lng, lngLat.lat],
          zoom: 10,
          duration: 1500,
          offset: [0, 150] // Push marker down 150px so the popup has room to open above it without clipping
        });
      }
    },
  }));

  return <div ref={containerRef} className="map-container" />;
});

export default MapView;
