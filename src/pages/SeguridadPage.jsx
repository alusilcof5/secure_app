import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const sosIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2VmNDQ0NCIvPjx0ZXh0IHg9IjIwIiB5PSIyNiIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TT1M8L3RleHQ+PC9zdmc+',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const safeIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDMwIDMwIj48Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSIxNSIgZmlsbD0iIzEwYjk4MSIvPjx0ZXh0IHg9IjE1IiB5PSIyMCIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKckzwvdGV4dD48L3N2Zz4=',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

const warningIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDMwIDMwIj48Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSIxNSIgZmlsbD0iI2Y1OWUwYiIvPjx0ZXh0IHg9IjE1IiB5PSIyMCIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4hPC90ZXh0Pjwvc3ZnPg==',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});


function LocationMarker({ position, setPosition }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 14);
    }
  }, [position, map]);

  useEffect(() => {
    map.locate().on('locationfound', (e) => {
      setPosition(e.latlng);
    });
  }, [map, setPosition]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <div className="text-center">
          <p className="font-semibold">📍 Tu ubicación actual</p>
          <p className="text-xs text-gray-600 mt-1">
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function SeguridadPage() {
  const [userPosition, setUserPosition] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [selectedZone, setSelectedZone] = useState(null);
  const [showSafeRoutes, setShowSafeRoutes] = useState(true);

  // Zonas de seguridad de ejemplo (en producción vendrían de una base de datos)
  const safeZones = [
    { id: 1, name: 'Comisaría Gràcia', position: [41.4045, 2.1589], radius: 300, type: 'police', safety: 95 },
    { id: 2, name: 'Hospital Clínic', position: [41.3888, 2.1540], radius: 250, type: 'hospital', safety: 90 },
    { id: 3, name: 'Zona Universitaria', position: [41.3874, 2.1154], radius: 400, type: 'university', safety: 85 },
    { id: 4, name: 'Centro Cívico Cotxeres', position: [41.3993, 2.1746], radius: 200, type: 'civic', safety: 80 },
  ];

  const dangerZones = [
    { id: 5, name: 'Zona poco iluminada', position: [41.3930, 2.1650], radius: 150, type: 'dark', safety: 45 },
    { id: 6, name: 'Área con incidentes reportados', position: [41.3800, 2.1700], radius: 200, type: 'incidents', safety: 50 },
  ];

  // Rutas seguras iluminadas (ejemplo)
  const safeRoutes = [
    {
      id: 1,
      name: 'Ruta Segura 1: Gràcia - Eixample',
      coordinates: [
        [41.4045, 2.1589],
        [41.4020, 2.1600],
        [41.4000, 2.1580],
        [41.3980, 2.1590],
        [41.3950, 2.1570],
      ],
      illumination: 95,
      traffic: 'high'
    },
    {
      id: 2,
      name: 'Ruta Segura 2: Passeig de Gràcia',
      coordinates: [
        [41.3874, 2.1700],
        [41.3900, 2.1690],
        [41.3930, 2.1680],
        [41.3960, 2.1670],
      ],
      illumination: 98,
      traffic: 'very high'
    }
  ];

  useEffect(() => {
    // Obtener ubicación inicial
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          // Ubicación por defecto: Barcelona
          setUserPosition({ lat: 41.3874, lng: 2.1686 });
        }
      );
    } else {
      setUserPosition({ lat: 41.3874, lng: 2.1686 });
    }

    // Cargar contactos de emergencia del localStorage
    const savedContacts = localStorage.getItem('emergencyContacts');
    if (savedContacts) {
      setEmergencyContacts(JSON.parse(savedContacts));
    }
  }, []);

  const handleSOS = () => {
    setSosActive(true);
    
    // Simular envío de alerta
    if (userPosition && emergencyContacts.length > 0) {
      const message = `🆘 ALERTA DE EMERGENCIA\n📍 Ubicación: https://maps.google.com/?q=${userPosition.lat},${userPosition.lng}\n⏰ ${new Date().toLocaleString('es-ES')}`;
      
      alert(`Alerta enviada a ${emergencyContacts.length} contacto(s):\n${message}`);
      
      // En producción, aquí se enviarían SMS/notificaciones reales
      emergencyContacts.forEach(contact => {
        console.log(`Enviando SOS a ${contact.name} (${contact.phone})`);
      });
    } else if (emergencyContacts.length === 0) {
      alert('⚠️ No tienes contactos de emergencia configurados. Por favor, añade al menos uno.');
    }

    // Desactivar después de 30 segundos
    setTimeout(() => setSosActive(false), 30000);
  };

  const handleShareLocation = () => {
    if (!sharingLocation && userPosition) {
      const shareLink = `https://maps.google.com/?q=${userPosition.lat},${userPosition.lng}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Mi ubicación - Camina Segura',
          text: 'Estoy compartiendo mi ubicación en tiempo real',
          url: shareLink
        });
      } else {
        navigator.clipboard.writeText(shareLink);
        alert('✅ Enlace de ubicación copiado al portapapeles');
      }
      
      setSharingLocation(true);
      setTimeout(() => setSharingLocation(false), 300000); // 5 minutos
    } else {
      setSharingLocation(false);
    }
  };

  const addEmergencyContact = () => {
    if (newContact.name && newContact.phone) {
      const updatedContacts = [...emergencyContacts, { ...newContact, id: Date.now() }];
      setEmergencyContacts(updatedContacts);
      localStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
      setNewContact({ name: '', phone: '' });
      setShowAddContact(false);
    }
  };

  const removeContact = (id) => {
    const updatedContacts = emergencyContacts.filter(c => c.id !== id);
    setEmergencyContacts(updatedContacts);
    localStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
  };

  const getZoneColor = (safety) => {
    if (safety >= 80) return '#10b981'; // Verde
    if (safety >= 60) return '#f59e0b'; // Naranja
    return '#ef4444'; // Rojo
  };

  if (!userPosition) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Obteniendo tu ubicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-serif font-bold mb-2">🛡️ Centro de Seguridad</h1>
          <p className="text-primary-100">
            Herramientas para tu seguridad personal en la ciudad
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Panel de Control */}
          <div className="lg:col-span-1 space-y-6">
            {/* Botón SOS */}
            <div className="card p-6 bg-white shadow-lg">
              <h3 className="text-xl font-serif font-semibold mb-4">🆘 Emergencia</h3>
              <button
                onClick={handleSOS}
                disabled={sosActive}
                className={`w-full py-6 rounded-lg font-bold text-xl transition-all transform ${
                  sosActive 
                    ? 'bg-red-600 text-white animate-pulse scale-105' 
                    : 'bg-red-500 text-white hover:bg-red-600 hover:scale-105'
                } disabled:opacity-50`}
              >
                {sosActive ? '🚨 ALERTA ACTIVA' : '🆘 ACTIVAR SOS'}
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                {sosActive 
                  ? 'Alerta enviada a tus contactos de emergencia' 
                  : 'Envía tu ubicación a contactos de confianza'}
              </p>
            </div>

            {/* Compartir Ubicación */}
            <div className="card p-6 bg-white shadow-lg">
              <h3 className="text-xl font-serif font-semibold mb-4">📍 Ubicación</h3>
              <button
                onClick={handleShareLocation}
                className={`w-full py-4 rounded-lg font-semibold transition-all ${
                  sharingLocation 
                    ? 'bg-green-500 text-white' 
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                {sharingLocation ? '✅ Compartiendo ubicación' : '📤 Compartir ubicación'}
              </button>
              {sharingLocation && (
                <p className="text-xs text-green-600 mt-2 text-center">
                  Compartiendo durante 5 minutos
                </p>
              )}
            </div>

            {/* Rutas Seguras Toggle */}
            <div className="card p-6 bg-white shadow-lg">
              <h3 className="text-xl font-serif font-semibold mb-4">💡 Rutas Iluminadas</h3>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Mostrar rutas seguras</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showSafeRoutes}
                    onChange={() => setShowSafeRoutes(!showSafeRoutes)}
                    className="sr-only"
                  />
                  <div className={`block w-14 h-8 rounded-full transition ${
                    showSafeRoutes ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                    showSafeRoutes ? 'transform translate-x-6' : ''
                  }`}></div>
                </div>
              </label>
              {showSafeRoutes && (
                <div className="mt-4 space-y-2">
                  {safeRoutes.map(route => (
                    <div key={route.id} className="text-sm p-3 bg-green-50 rounded-lg">
                      <p className="font-semibold text-green-800">{route.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-green-600">💡 Iluminación: {route.illumination}%</span>
                        <span className="text-xs text-green-600">👥 Tráfico: {route.traffic}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contactos de Emergencia */}
            <div className="card p-6 bg-white shadow-lg">
              <h3 className="text-xl font-serif font-semibold mb-4">👥 Contactos de Emergencia</h3>
              
              {emergencyContacts.length === 0 && (
                <p className="text-sm text-gray-500 mb-3">
                  No tienes contactos configurados
                </p>
              )}

              <div className="space-y-2 mb-4">
                {emergencyContacts.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">{contact.name}</p>
                      <p className="text-xs text-gray-600">{contact.phone}</p>
                    </div>
                    <button
                      onClick={() => removeContact(contact.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {!showAddContact ? (
                <button
                  onClick={() => setShowAddContact(true)}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition"
                >
                  + Añadir contacto
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={addEmergencyContact}
                      className="flex-1 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setShowAddContact(false);
                        setNewContact({ name: '', phone: '' });
                      }}
                      className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Estadísticas */}
            <div className="card p-6 bg-white shadow-lg">
              <h3 className="text-xl font-serif font-semibold mb-4">📊 Tu Seguridad</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Zona actual</span>
                    <span className="font-semibold text-green-600">Segura</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">15</p>
                    <p className="text-xs text-gray-600">Zonas seguras cercanas</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">3</p>
                    <p className="text-xs text-gray-600">Rutas iluminadas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa */}
          <div className="lg:col-span-2">
            <div className="card p-0 bg-white shadow-lg overflow-hidden">
              <div className="h-[calc(100vh-12rem)]">
                <MapContainer
                  center={[userPosition.lat, userPosition.lng]}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />

                  {/* Ubicación del usuario */}
                  <LocationMarker position={userPosition} setPosition={setUserPosition} />

                  {/* Zonas seguras */}
                  {safeZones.map(zone => (
                    <React.Fragment key={zone.id}>
                      <Circle
                        center={zone.position}
                        radius={zone.radius}
                        pathOptions={{
                          color: getZoneColor(zone.safety),
                          fillColor: getZoneColor(zone.safety),
                          fillOpacity: 0.2
                        }}
                        eventHandlers={{
                          click: () => setSelectedZone(zone)
                        }}
                      />
                      <Marker position={zone.position} icon={safeIcon}>
                        <Popup>
                          <div className="text-center">
                            <p className="font-semibold text-green-700">{zone.name}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Nivel de seguridad: {zone.safety}%
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${zone.safety}%` }}
                              ></div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  ))}

                  {/* Zonas de peligro */}
                  {dangerZones.map(zone => (
                    <React.Fragment key={zone.id}>
                      <Circle
                        center={zone.position}
                        radius={zone.radius}
                        pathOptions={{
                          color: getZoneColor(zone.safety),
                          fillColor: getZoneColor(zone.safety),
                          fillOpacity: 0.3
                        }}
                      />
                      <Marker position={zone.position} icon={warningIcon}>
                        <Popup>
                          <div className="text-center">
                            <p className="font-semibold text-orange-700">{zone.name}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              ⚠️ Precaución recomendada
                            </p>
                            <p className="text-xs text-gray-600">
                              Seguridad: {zone.safety}%
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  ))}

                  {/* Rutas seguras */}
                  {showSafeRoutes && safeRoutes.map(route => (
                    <Polyline
                      key={route.id}
                      positions={route.coordinates}
                      pathOptions={{
                        color: '#10b981',
                        weight: 6,
                        opacity: 0.7,
                        dashArray: '10, 5'
                      }}
                    >
                      <Popup>
                        <div className="text-center">
                          <p className="font-semibold text-green-700">{route.name}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            💡 Iluminación: {route.illumination}%
                          </p>
                          <p className="text-xs text-gray-600">
                            👥 Tráfico peatonal: {route.traffic}
                          </p>
                        </div>
                      </Popup>
                    </Polyline>
                  ))}

                  {/* Marcador SOS si está activo */}
                  {sosActive && (
                    <Marker position={userPosition} icon={sosIcon}>
                      <Popup>
                        <div className="text-center">
                          <p className="font-semibold text-red-600">🆘 ALERTA SOS ACTIVA</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date().toLocaleTimeString('es-ES')}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>

              {/* Leyenda del mapa */}
              <div className="p-4 bg-gray-50 border-t">
                <h4 className="font-semibold text-sm mb-2">📌 Leyenda</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span>Zona segura (80%+)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                    <span>Precaución (60-79%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span>Evitar (&lt;60%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-1 bg-green-500"></div>
                    <span>Ruta iluminada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}