import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { 
  getAllBusStops, 
  getAllBusLines,
  getBusLineStops,
  getNearbyBusStops,
  getBusStopCorrespondences 
} from '../services/tmbService';

// Custom bus icon
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function BusTransportPage() {
  const [busLines, setBusLines] = useState([]);
  const [busStops, setBusStops] = useState([]);
  const [selectedLine, setSelectedLine] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [radius, setRadius] = useState(500);
  const [viewMode, setViewMode] = useState('nearby'); // 'nearby' | 'line' | 'all'

  const barcelonaCenter = [41.3851, 2.1734];

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        setUserLocation(barcelonaCenter);
      }
    );
  }, []);

  // Load bus lines on mount
  useEffect(() => {
    loadBusLines();
  }, []);

  // Load bus stops based on view mode
  useEffect(() => {
    if (!userLocation) return;
    
    if (viewMode === 'nearby') {
      loadNearbyStops();
    } else if (viewMode === 'line' && selectedLine) {
      loadLineStops(selectedLine);
    } else if (viewMode === 'all') {
      loadAllStops();
    }
  }, [userLocation, viewMode, selectedLine, radius]);

  const loadBusLines = async () => {
    setLoading(true);
    try {
      const lines = await getAllBusLines();
      setBusLines(lines);
      console.log(`✅ ${lines.length} líneas de bus cargadas`);
    } catch (error) {
      console.error('Error loading bus lines:', error);
      alert('Error al cargar líneas de bus. Verifica tus credenciales TMB API.');
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyStops = async () => {
    setLoading(true);
    try {
      const stops = await getNearbyBusStops(
        userLocation[0],
        userLocation[1],
        radius
      );
      setBusStops(stops);
      console.log(`✅ ${stops.length} paradas cercanas cargadas`);
    } catch (error) {
      console.error('Error loading nearby stops:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLineStops = async (lineCode) => {
    setLoading(true);
    try {
      const stops = await getBusLineStops(lineCode);
      setBusStops(stops);
      console.log(`✅ ${stops.length} paradas de línea ${lineCode} cargadas`);
    } catch (error) {
      console.error('Error loading line stops:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllStops = async () => {
    setLoading(true);
    try {
      const stops = await getAllBusStops({ filter: 'ID_POBLACIO=748' }); // Barcelona
      setBusStops(stops.slice(0, 200)); // Limitar a 200 para performance
      console.log(`✅ ${stops.length} paradas totales (mostrando 200)`);
    } catch (error) {
      console.error('Error loading all stops:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLines = busLines.filter(line =>
    line.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    line.code.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚌 Transporte en Bus
          </h1>
          <p className="text-gray-600">
            Datos en tiempo real de TMB Barcelona (API Oficial)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de control */}
          <div className="lg:col-span-1 space-y-6">
            {/* View Mode Selector */}
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Modo de visualización</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setViewMode('nearby')}
                  className={`w-full px-4 py-3 rounded-lg text-left transition ${
                    viewMode === 'nearby'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  📍 Paradas cercanas
                </button>
                <button
                  onClick={() => setViewMode('line')}
                  className={`w-full px-4 py-3 rounded-lg text-left transition ${
                    viewMode === 'line'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  🚍 Por línea
                </button>
                <button
                  onClick={() => setViewMode('all')}
                  className={`w-full px-4 py-3 rounded-lg text-left transition ${
                    viewMode === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  🗺️ Todas las paradas
                </button>
              </div>
            </div>

            {/* Radius selector (solo para modo nearby) */}
            {viewMode === 'nearby' && (
              <div className="card p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Radio de búsqueda: {radius}m
                </label>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Line selector (solo para modo line) */}
            {viewMode === 'line' && (
              <div className="card p-6">
                <h3 className="font-semibold text-lg mb-4">Seleccionar línea</h3>
                <input
                  type="text"
                  placeholder="Buscar línea..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg mb-4"
                />
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredLines.map(line => (
                    <button
                      key={line.id}
                      onClick={() => setSelectedLine(line.code)}
                      className={`w-full px-4 py-2 rounded-lg text-left transition ${
                        selectedLine === line.code
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{line.code}</span>
                        <span className="text-sm">{line.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="card p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-lg mb-4">Estadísticas</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Líneas totales:</span>
                  <span className="font-semibold">{busLines.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paradas visibles:</span>
                  <span className="font-semibold">{busStops.length}</span>
                </div>
                {loading && (
                  <div className="text-blue-600 flex items-center">
                    <span className="animate-spin mr-2">⟳</span>
                    Cargando...
                  </div>
                )}
              </div>
            </div>

            {/* API Status */}
            <div className="card p-4 bg-green-50 border-green-200">
              <p className="text-xs text-green-800">
                ✅ <strong>API TMB Activa</strong><br />
                Datos oficiales en tiempo real
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
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />

                  {/* User location with radius */}
                  {viewMode === 'nearby' && (
                    <>
                      <Circle
                        center={userLocation}
                        radius={radius}
                        pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
                      />
                      <Marker position={userLocation}>
                        <Popup>
                          <strong>Tu ubicación</strong>
                        </Popup>
                      </Marker>
                    </>
                  )}

                  {/* Bus stops */}
                  {busStops.map((stop) => (
                    <Marker 
                      key={stop.id} 
                      position={[stop.lat, stop.lng]} 
                      icon={busIcon}
                    >
                      <Popup>
                        <div className="text-sm">
                          <h4 className="font-bold text-base mb-2">{stop.name}</h4>
                          <p><strong>Código:</strong> {stop.code}</p>
                          {stop.description && <p><strong>Desc:</strong> {stop.description}</p>}
                          {stop.address && <p><strong>Dir:</strong> {stop.address}</p>}
                          {stop.district && <p><strong>Distrito:</strong> {stop.district}</p>}
                          {stop.distance && <p><strong>Distancia:</strong> {stop.distance}m</p>}
                          {stop.type && <p><strong>Tipo:</strong> {stop.type}</p>}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin text-4xl mb-4">⟳</div>
                    <p className="text-gray-600">Cargando ubicación...</p>
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
