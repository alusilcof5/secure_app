import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


const createCustomIcon = (type, color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        border: 2px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          font-size: 12px;
          text-align: center;
          line-height: 20px;
        ">${getIconEmoji(type)}</div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

const getIconEmoji = (type) => {
  const icons = {
    cultural: '🎭',
    restaurant: '🍽️',
    info: 'ℹ️',
    equipament: '🏛️'
  };
  return icons[type] || '📍';
};

const getColorByType = (type) => {
  const colors = {
    cultural: '#ff6b9d',
    restaurant: '#ffa500',
    info: '#4ecdc4',
    equipament: '#7b68ee'
  };
  return colors[type] || '#666666';
};

export default function MapComponent({ data, filters, onMarkerClick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([41.3851, 2.1734], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  
  useEffect(() => {
    if (!mapInstanceRef.current || !data) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    
    let filteredData = data;
    
    if (filters.types.length > 0) {
      filteredData = filteredData.filter(item => filters.types.includes(item.type));
    }

    if (filters.district) {
      filteredData = filteredData.filter(item => 
        item.district === filters.district || item.municipality === filters.district
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }

   
    const bounds = [];
    
    filteredData.forEach(item => {
      const color = getColorByType(item.type);
      const icon = createCustomIcon(item.type, color);
      
      const marker = L.marker([item.lat, item.lng], { icon })
        .addTo(mapInstanceRef.current);

      // Popup
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${item.name}</h3>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">
            <strong>Categoría:</strong> ${item.category}
          </p>
          ${item.address ? `<p style="margin: 4px 0; font-size: 12px; color: #666;">${item.address}</p>` : ''}
          ${item.district ? `<p style="margin: 4px 0; font-size: 12px; color: #666;"><strong>Distrito:</strong> ${item.district}</p>` : ''}
          ${item.phone ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Tel:</strong> ${item.phone}</p>` : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent);
      
      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(item);
        }
      });

      markersRef.current.push(marker);
      bounds.push([item.lat, item.lng]);
    });

 
    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [data, filters, onMarkerClick]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-xl"
      style={{ minHeight: '600px' }}
    />
  );
}
