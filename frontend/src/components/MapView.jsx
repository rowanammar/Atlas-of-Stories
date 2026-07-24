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
      center: [35.2137, 31.7683], // Center near Palestine
      zoom: 6,
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
          minzoom: 3,
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

      const el = document.createElement('div');
      el.className = `bubble-marker ${normalizeType(loc.type)}`;
      el.style.animationDelay = `${i * 80}ms`;

      const popup = new maplibregl.Popup({
        offset: 16,
        maxWidth: '320px',
        closeButton: true,
      }).setHTML(buildPopupHTML(loc));

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([loc.lng, loc.lat])
        .setPopup(popup)
        .addTo(mapRef.current);

      markersRef.current.push(marker);
      bounds.extend([loc.lng, loc.lat]);
    });

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, {
        padding: { top: 100, bottom: 60, left: 420, right: 60 },
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
        marker.togglePopup();
        const lngLat = marker.getLngLat();
        mapRef.current?.flyTo({
          center: [lngLat.lng, lngLat.lat],
          zoom: 10,
          duration: 1500,
        });
      }
    },
  }));

  return <div ref={containerRef} className="map-container" />;
});

export default MapView;
