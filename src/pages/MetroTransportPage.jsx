import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getAllMetroStations, getAllMetroLines, getMetroLineStations, getNearbyMetroStations } from '../services/tmbService';

const metroIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448349.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function MetroTransportPage() {
  const [metroStations, setMetroStations] = useState([]);
  const [metroLines, setMetroLines] = useState([]);
  const [selectedLine, setSelectedLine] = useState(null);
  const [userLocation, setUserLocation] = useState([41.3851, 2.1734]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('all');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setUserLocation([41.3851, 2.1734])
    );
    loadMetroLines();
  }, []);

  useEffect(() => {
    if (viewMode === 'all') {
      loadAllStations();
    } else if (viewMode === 'line' && selectedLine) {
      loadLineStations(selectedLine);
    } else if (viewMode === 'nearby') {
      loadNearbyStations();
    }
  }, [viewMode, selectedLine]);

  const loadMetroLines = async () => {
    try {
      const lines = await getAllMetroLines();
      setMetroLines(lines);
    } catch (error) {
      console.error('Error loading metro lines:', error);
    }
  };

  const loadAllStations = async () => {
    setLoading(true);
    try {
      const stations = await getAllMetroStations();
      setMetroStations(stations);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLineStations = async (lineCode) => {
    setLoading(true);
    try {
      const stations = await getMetroLineStations(lineCode);
      setMetroStations(stations);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyStations = async () => {
    setLoading(true);
    try {
      const stations = await getNearbyMetroStations(userLocation[0], userLocation[1], 1500);
      setMetroStations(stations);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🚇 Metro de Barcelona</h1>
        <p className="text-gray-600 mb-8">Red de Metro TMB - Datos oficiales</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Modo</h3>
              <div className="space-y-2">
                <button onClick={() => setViewMode('all')} className={`w-full px-4 py-3 rounded-lg ${viewMode === 'all' ? 'bg-red-500 text-white' : 'bg-gray-100'}`}>
                  🗺️ Todas las estaciones
                </button>
                <button onClick={() => setViewMode('nearby')} className={`w-full px-4 py-3 rounded-lg ${viewMode === 'nearby' ? 'bg-red-500 text-white' : 'bg-gray-100'}`}>
                  📍 Cercanas
                </button>
                <button onClick={() => setViewMode('line')} className={`w-full px-4 py-3 rounded-lg ${viewMode === 'line' ? 'bg-red-500 text-white' : 'bg-gray-100'}`}>
                  🚇 Por línea
                </button>
              </div>
            </div>

            {viewMode === 'line' && (
              <div className="card p-6">
                <h3 className="font-semibold text-lg mb-4">Líneas</h3>
                <div className="space-y-2">
                  {metroLines.map(line => (
                    <button key={line.id} onClick={() => setSelectedLine(line.code)} className={`w-full px-4 py-2 rounded-lg ${selectedLine === line.code ? 'bg-red-500 text-white' : 'bg-gray-100'}`}>
                      Línea {line.code} - {line.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="card p-6 bg-red-50">
              <h3 className="font-semibold mb-2">Estadísticas</h3>
              <div className="text-sm space-y-2">
                <p>Líneas: {metroLines.length}</p>
                <p>Estaciones visibles: {metroStations.length}</p>
                {loading && <p className="text-red-600">⟳ Cargando...</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card p-0" style={{height: '700px'}}>
              <MapContainer center={userLocation} zoom={13} style={{height: '100%'}}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {metroStations.map(station => (
                  <Marker key={station.id} position={[station.lat, station.lng]} icon={metroIcon}>
                    <Popup>
                      <h4 className="font-bold">{station.name}</h4>
                      <p>Líneas: {station.lines.join(', ')}</p>
                      {station.distance && <p>Distancia: {station.distance}m</p>}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
