import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const metroIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448349.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const bicingIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3074/3074761.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const homeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/619/619032.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

// Component to recenter map
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function TransportePage() {
  // State
  const [userLocation, setUserLocation] = useState(null);
  const [homeAddress, setHomeAddress] = useState('');
  const [homeCoords, setHomeCoords] = useState(null);
  const [transportData, setTransportData] = useState({
    bus: [],
    metro: [],
    bicing: [],
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    bus: true,
    metro: true,
    bicing: true,
    maxDistance: 500, // metros
  });
  const [showSimulator, setShowSimulator] = useState(false);
  const [routeOptions, setRouteOptions] = useState([]);

  const mapRef = useRef();

  // Barcelona center as default
  const barcelonaCenter = [41.3851, 2.1734];

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setUserLocation(barcelonaCenter); // Fallback
        }
      );
    } else {
      setUserLocation(barcelonaCenter);
    }
  }, []);

  // Fetch transport data
  useEffect(() => {
    if (!userLocation) return;

    const fetchTransportData = async () => {
      setLoading(true);
      try {
        // NOTA: Estas son llamadas mock. En producción, conectar a APIs reales de TMB/Bicing
        
        // Mock Bus stops (TMB API real: https://api.tmb.cat/v1/transit/parades/...)
        const busStops = await fetchBusStops(userLocation);
        
        // Mock Metro stations
        const metroStations = await fetchMetroStations(userLocation);
        
        // Bicing API real disponible: https://www.bicing.barcelona/availability_map/getJsonObject
        const bicingStations = await fetchBicingStations(userLocation);

        setTransportData({
          bus: busStops,
          metro: metroStations,
          bicing: bicingStations,
        });
      } catch (error) {
        console.error('Error fetching transport data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransportData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchTransportData, 30000);
    return () => clearInterval(interval);
  }, [userLocation, filters.maxDistance]);

  // Mock fetch functions (REEMPLAZAR con APIs reales)
  const fetchBusStops = async (location) => {
    // Simulación: generar paradas cercanas
    // En producción: fetch a TMB API
    return Array.from({ length: 8 }, (_, i) => ({
      id: `bus-${i}`,
      name: `Parada ${i + 1}`,
      lines: [`H${10 + i}`, `V${i + 1}`],
      lat: location[0] + (Math.random() - 0.5) * 0.01,
      lng: location[1] + (Math.random() - 0.5) * 0.01,
      nextBus: `${Math.floor(Math.random() * 15) + 1} min`,
      distance: Math.floor(Math.random() * 500) + 50,
    }));
  };

  const fetchMetroStations = async (location) => {
    // Estaciones de metro reales en Barcelona (subset)
    const realStations = [
      { name: 'Sagrada Família', lines: ['L2', 'L5'], lat: 41.4036, lng: 2.1744 },
      { name: 'Passeig de Gràcia', lines: ['L2', 'L3', 'L4'], lat: 41.3916, lng: 2.1649 },
      { name: 'Plaça Catalunya', lines: ['L1', 'L3'], lat: 41.3874, lng: 2.1700 },
      { name: 'Diagonal', lines: ['L3', 'L5'], lat: 41.3968, lng: 2.1531 },
      { name: 'Sants Estació', lines: ['L3', 'L5'], lat: 41.3793, lng: 2.1404 },
    ];

    return realStations
      .map((station) => ({
        ...station,
        id: `metro-${station.name}`,
        distance: calculateDistance(location, [station.lat, station.lng]),
        status: 'Operativo',
      }))
      .filter((s) => s.distance < filters.maxDistance)
      .sort((a, b) => a.distance - b.distance);
  };

  const fetchBicingStations = async (location) => {
    // NOTA: Bicing tiene API pública real
    // https://www.bicing.barcelona/availability_map/getJsonObject
    try {
      const response = await fetch('https://www.bicing.barcelona/availability_map/getJsonObject');
      const data = await response.json();
      
      return data.features
        .filter((f) => f.properties.bikes > 0 || f.properties.slots > 0)
        .map((feature) => {
          const [lng, lat] = feature.geometry.coordinates;
          return {
            id: feature.properties.id,
            name: feature.properties.name,
            lat,
            lng,
            bikes: feature.properties.bikes,
            slots: feature.properties.slots,
            distance: calculateDistance(location, [lat, lng]),
          };
        })
        .filter((s) => s.distance < filters.maxDistance)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 15); // Limitar a 15 más cercanas
    } catch (error) {
      console.error('Error fetching Bicing data:', error);
      // Fallback a mock
      return Array.from({ length: 6 }, (_, i) => ({
        id: `bicing-${i}`,
        name: `Estación Bicing ${i + 1}`,
        lat: location[0] + (Math.random() - 0.5) * 0.008,
        lng: location[1] + (Math.random() - 0.5) * 0.008,
        bikes: Math.floor(Math.random() * 15),
        slots: Math.floor(Math.random() * 10),
        distance: Math.floor(Math.random() * 500) + 50,
      }));
    }
  };

  // Calculate distance between two points (Haversine)
  const calculateDistance = (point1, point2) => {
    const R = 6371000; // Radio de la Tierra en metros
    const lat1 = (point1[0] * Math.PI) / 180;
    const lat2 = (point2[0] * Math.PI) / 180;
    const deltaLat = ((point2[0] - point1[0]) * Math.PI) / 180;
    const deltaLng = ((point2[1] - point1[1]) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // Simulate route home
  const handleSimulateRoute = async () => {
    if (!homeAddress) {
      alert('Introduce una dirección de destino');
      return;
    }

    setLoading(true);

    try {
      // Geocode home address (usar API de Nominatim o Google)
      const geocodeResult = await geocodeAddress(homeAddress);
      
      if (!geocodeResult) {
        alert('No se pudo encontrar la dirección');
        setLoading(false);
        return;
      }

      setHomeCoords(geocodeResult);

      // Calculate route options
      const options = calculateRouteOptions(userLocation, geocodeResult);
      setRouteOptions(options);
      setShowSimulator(true);
    } catch (error) {
      console.error('Error simulating route:', error);
      alert('Error al simular la ruta');
    } finally {
      setLoading(false);
    }
  };

  // Geocode address
  const geocodeAddress = async (address) => {
    try {
      // Usar Nominatim (OpenStreetMap) - gratuito
      const query = `${address}, Barcelona`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Calculate route options (simplified)
  const calculateRouteOptions = (origin, destination) => {
    const distance = calculateDistance(origin, destination);
    const options = [];

    // Opción 1: Metro + caminar
    const nearbyMetro = transportData.metro.filter((s) => s.distance < 300)[0];
    if (nearbyMetro) {
      options.push({
        id: 'metro',
        type: 'Metro + Caminar',
        steps: [
          `Caminar ${nearbyMetro.distance}m hasta ${nearbyMetro.name}`,
          `Tomar línea ${nearbyMetro.lines[0]}`,
          'Caminar hasta destino',
        ],
        estimatedTime: Math.round(distance / 100) + 10, // minutos aprox
        safety: 'alta',
        icon: '🚇',
      });
    }

    // Opción 2: Bus
    const nearbyBus = transportData.bus.filter((s) => s.distance < 200)[0];
    if (nearbyBus) {
      options.push({
        id: 'bus',
        type: 'Bus',
        steps: [
          `Caminar ${nearbyBus.distance}m hasta ${nearbyBus.name}`,
          `Tomar línea ${nearbyBus.lines[0]} (próximo: ${nearbyBus.nextBus})`,
          'Caminar hasta destino',
        ],
        estimatedTime: Math.round(distance / 80) + 15,
        safety: 'media-alta',
        icon: '🚌',
      });
    }

    // Opción 3: Bicing
    const nearbyBicing = transportData.bicing.filter((s) => s.bikes > 0 && s.distance < 200)[0];
    if (nearbyBicing && distance < 5000) {
      options.push({
        id: 'bicing',
        type: 'Bicing',
        steps: [
          `Caminar ${nearbyBicing.distance}m hasta ${nearbyBicing.name}`,
          `Tomar bici (${nearbyBicing.bikes} disponibles)`,
          'Ir en bici hasta destino',
        ],
        estimatedTime: Math.round(distance / 200),
        safety: 'media',
        icon: '🚲',
      });
    }

    // Opción 4: Caminar (si < 2km)
    if (distance < 2000) {
      options.push({
        id: 'walk',
        type: 'Caminar',
        steps: [`Caminar ${distance}m directamente`],
        estimatedTime: Math.round(distance / 70),
        safety: 'variable',
        icon: '🚶‍♀️',
      });
    }

    return options;
  };

  // Filtered transport data
  const getFilteredData = () => {
    return {
      bus: filters.bus ? transportData.bus : [],
      metro: filters.metro ? transportData.metro : [],
      bicing: filters.bicing ? transportData.bicing : [],
    };
  };

  const filteredData = getFilteredData();
  const totalPoints = filteredData.bus.length + filteredData.metro.length + filteredData.bicing.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-primary-600 text-white py-8">
        <div className="container">
          <h1 className="text-3xl font-serif font-bold mb-2">Transporte en Tiempo Real</h1>
          <p className="text-primary-100">
            Visualiza el transporte público cerca de ti y simula tu vuelta a casa de forma segura
          </p>
        </div>
      </section>

      <div className="container py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar - Filters & Simulator */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filters Card */}
            <div className="card p-6">
              <h3 className="font-serif font-semibold text-lg mb-4 flex items-center">
                <span className="mr-2">🎛️</span>
                Filtros de Transporte
              </h3>

              {/* Transport type filters */}
              <div className="space-y-3 mb-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.bus}
                    onChange={(e) => setFilters({ ...filters, bus: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm">🚌 Bus ({transportData.bus.length})</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.metro}
                    onChange={(e) => setFilters({ ...filters, metro: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm">🚇 Metro ({transportData.metro.length})</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.bicing}
                    onChange={(e) => setFilters({ ...filters, bicing: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm">🚲 Bicing ({transportData.bicing.length})</span>
                </label>
              </div>

              {/* Distance filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distancia máxima: {filters.maxDistance}m
                </label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={filters.maxDistance}
                  onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600">
                  <p className="mb-1">
                    <strong>{totalPoints}</strong> puntos visibles
                  </p>
                  {loading && (
                    <p className="text-primary-600 flex items-center">
                      <span className="animate-spin mr-2">⟳</span>
                      Actualizando...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Simulator Card */}
            <div className="card p-6">
              <h3 className="font-serif font-semibold text-lg mb-4 flex items-center">
                <span className="mr-2">🏠</span>
                Simular Vuelta a Casa
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección de destino
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Carrer de Provença, 250"
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleSimulateRoute}
                  disabled={loading || !homeAddress}
                  className="btn btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Calculando...' : 'Calcular rutas'}
                </button>
              </div>

              {/* Route options */}
              {showSimulator && routeOptions.length > 0 && (
                <div className="mt-6 pt-6 border-t space-y-4">
                  <h4 className="font-semibold text-sm text-gray-900">Opciones disponibles:</h4>
                  {routeOptions.map((option) => (
                    <div
                      key={option.id}
                      className="p-4 bg-gray-50 rounded-lg border hover:border-primary-400 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{option.icon}</span>
                          <span className="font-semibold text-sm">{option.type}</span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                          ~{option.estimatedTime} min
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        {option.steps.map((step, i) => (
                          <p key={i}>• {step}</p>
                        ))}
                      </div>
                      <div className="mt-2 text-xs">
                        <span
                          className={`px-2 py-1 rounded ${
                            option.safety === 'alta'
                              ? 'bg-green-100 text-green-800'
                              : option.safety === 'media-alta'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          Seguridad: {option.safety}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Note */}
            <div className="card p-4 bg-blue-50 border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>Nota:</strong> Los datos de Bicing son en tiempo real. Bus y Metro usan datos 
                simulados. Para datos 100% reales, integrar APIs de TMB.
              </p>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <div className="card p-0 overflow-hidden" style={{ height: '700px' }}>
              {userLocation ? (
                <MapContainer
                  center={userLocation}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                  ref={mapRef}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <RecenterMap center={userLocation} />

                  {/* User location */}
                  <Circle
                    center={userLocation}
                    radius={filters.maxDistance}
                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
                  />
                  <Marker position={userLocation}>
                    <Popup>
                      <strong>Tu ubicación</strong>
                      <br />
                      Lat: {userLocation[0].toFixed(4)}
                      <br />
                      Lng: {userLocation[1].toFixed(4)}
                    </Popup>
                  </Marker>

                  {/* Home location */}
                  {homeCoords && (
                    <Marker position={homeCoords} icon={homeIcon}>
                      <Popup>
                        <strong>Destino (Casa)</strong>
                        <br />
                        {homeAddress}
                      </Popup>
                    </Marker>
                  )}

                  {/* Bus stops */}
                  {filteredData.bus.map((stop) => (
                    <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={busIcon}>
                      <Popup>
                        <strong>🚌 {stop.name}</strong>
                        <br />
                        Líneas: {stop.lines.join(', ')}
                        <br />
                        Próximo: {stop.nextBus}
                        <br />
                        Distancia: {stop.distance}m
                      </Popup>
                    </Marker>
                  ))}

                  {/* Metro stations */}
                  {filteredData.metro.map((station) => (
                    <Marker key={station.id} position={[station.lat, station.lng]} icon={metroIcon}>
                      <Popup>
                        <strong>🚇 {station.name}</strong>
                        <br />
                        Líneas: {station.lines.join(', ')}
                        <br />
                        Estado: {station.status}
                        <br />
                        Distancia: {station.distance}m
                      </Popup>
                    </Marker>
                  ))}

                  {/* Bicing stations */}
                  {filteredData.bicing.map((station) => (
                    <Marker key={station.id} position={[station.lat, station.lng]} icon={bicingIcon}>
                      <Popup>
                        <strong>🚲 {station.name}</strong>
                        <br />
                        Bicis disponibles: {station.bikes}
                        <br />
                        Slots libres: {station.slots}
                        <br />
                        Distancia: {station.distance}m
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="animate-spin text-4xl mb-4">⟳</div>
                    <p>Cargando mapa y ubicación...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}