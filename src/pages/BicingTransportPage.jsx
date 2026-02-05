import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { getAllBicingStations, getNearbyBicingStations, getBicingStationsWithBikes, getBicingStats } from '../services/bicingService';

const bicingIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3074/3074761.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

export default function BicingTransportPage() {
  const [stations, setStations] = useState([]);
  const [stats, setStats] = useState(null);
  const [userLocation, setUserLocation] = useState([41.3851, 2.1734]);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'nearby' | 'withBikes'
  const [radius, setRadius] = useState(500);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setUserLocation([41.3851, 2.1734])
    );
    loadStats();
  }, []);

  useEffect(() => {
    loadStations();
  }, [filterMode, radius, userLocation]);

  const loadStations = async () => {
    setLoading(true);
    try {
      let data;
      if (filterMode === 'all') {
        data = await getAllBicingStations();
        setStations(data.slice(0, 150)); // Limitar para performance
      } else if (filterMode === 'nearby') {
        data = await getNearbyBicingStations(userLocation[0], userLocation[1], radius);
        setStations(data);
      } else if (filterMode === 'withBikes') {
        data = await getBicingStationsWithBikes(userLocation[0], userLocation[1], 1500, 1);
        setStations(data);
      }
    } catch (error) {
      console.error('Error loading Bicing:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getBicingStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🚲 Bicing Barcelona</h1>
        <p className="text-gray-600 mb-8">Datos en tiempo real - API oficial</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Filtros</h3>
              <div className="space-y-2">
                <button onClick={() => setFilterMode('all')} className={`w-full px-4 py-3 rounded-lg ${filterMode === 'all' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>
                  🗺️ Todas
                </button>
                <button onClick={() => setFilterMode('nearby')} className={`w-full px-4 py-3 rounded-lg ${filterMode === 'nearby' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>
                  📍 Cercanas
                </button>
                <button onClick={() => setFilterMode('withBikes')} className={`w-full px-4 py-3 rounded-lg ${filterMode === 'withBikes' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>
                  🚲 Con bicis disponibles
                </button>
              </div>
            </div>

            {filterMode === 'nearby' && (
              <div className="card p-6">
                <label className="block text-sm font-medium mb-2">Radio: {radius}m</label>
                <input type="range" min="100" max="2000" step="100" value={radius} onChange={(e) => setRadius(parseInt(e.target.value))} className="w-full" />
              </div>
            )}

            {stats && (
              <div className="card p-6 bg-green-50">
                <h3 className="font-semibold mb-4">Estadísticas generales</h3>
                <div className="text-sm space-y-2">
                  <p>Total estaciones: {stats.total}</p>
                  <p>Abiertas: {stats.open}</p>
                  <p>Bicis disponibles: {stats.bikes.total}</p>
                  <p>• Mecánicas: {stats.bikes.mechanical}</p>
                  <p>• Eléctricas: {stats.bikes.electrical}</p>
                  <p>Slots libres: {stats.slots.available}</p>
                </div>
              </div>
            )}

            <div className="card p-4 bg-green-50">
              <p className="text-xs">✅ <strong>Datos en tiempo real</strong><br/>Actualizado cada 60 segundos</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card p-0" style={{height: '700px'}}>
              <MapContainer center={userLocation} zoom={14} style={{height: '100%'}}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {filterMode === 'nearby' && (
                  <Circle center={userLocation} radius={radius} pathOptions={{color: 'green', fillOpacity: 0.1}} />
                )}
                {stations.map(station => (
                  <Marker key={station.id} position={[station.lat, station.lng]} icon={bicingIcon}>
                    <Popup>
                      <div className="text-sm">
                        <h4 className="font-bold mb-2">{station.name}</h4>
                        <p>Estado: {station.isOpen ? '✅ Abierta' : '❌ Cerrada'}</p>
                        <p>Bicis mecánicas: {station.bikes.mechanical}</p>
                        <p>Bicis eléctricas: {station.bikes.electrical}</p>
                        <p>Slots libres: {station.slots}</p>
                        {station.distance && <p>Distancia: {station.distance}m</p>}
                      </div>
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
