import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getAllBusStops, getAllMetroStations } from '../services/tmbService';

const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const metroIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448349.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

export default function StopsStationsPage() {
  const [busStops, setBusStops] = useState([]);
  const [metroStations, setMetroStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBus, setShowBus] = useState(true);
  const [showMetro, setShowMetro] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const barcelonaCenter = [41.3851, 2.1734];

  const loadBusStops = async () => {
    setLoading(true);
    try {
      const stops = await getAllBusStops({ filter: 'ID_POBLACIO=748' });
      setBusStops(stops.slice(0, 300)); // Limitar para performance
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetroStations = async () => {
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

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadBusStops(), loadMetroStations()]);
    setLoading(false);
  };

  const filteredBusStops = busStops.filter(stop =>
    stop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMetroStations = metroStations.filter(station =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📍 Paradas y Estaciones</h1>
        <p className="text-gray-600 mb-8">Explorador completo de infraestructura TMB</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Cargar datos</h3>
              <div className="space-y-2">
                <button onClick={loadBusStops} className="btn btn-primary w-full">🚌 Cargar paradas Bus</button>
                <button onClick={loadMetroStations} className="btn btn-secondary w-full">🚇 Cargar estaciones Metro</button>
                <button onClick={loadAll} className="btn w-full bg-purple-500 text-white hover:bg-purple-600">📊 Cargar todo</button>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Filtros</h3>
              <input type="text" placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border rounded-lg mb-4" />
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" checked={showBus} onChange={(e) => setShowBus(e.target.checked)} className="mr-2" />
                  <span>Mostrar paradas de bus</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={showMetro} onChange={(e) => setShowMetro(e.target.checked)} className="mr-2" />
                  <span>Mostrar estaciones de metro</span>
                </label>
              </div>
            </div>

            <div className="card p-6 bg-purple-50">
              <h3 className="font-semibold mb-2">Estadísticas</h3>
              <div className="text-sm space-y-2">
                <p>Paradas bus: {busStops.length}</p>
                <p>Estaciones metro: {metroStations.length}</p>
                <p>Filtradas bus: {filteredBusStops.length}</p>
                <p>Filtradas metro: {filteredMetroStations.length}</p>
                {loading && <p className="text-purple-600">⟳ Cargando...</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="card p-0" style={{height: '700px'}}>
              <MapContainer center={barcelonaCenter} zoom={13} style={{height: '100%'}}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {showBus && filteredBusStops.map(stop => (
                  <Marker key={`bus-${stop.id}`} position={[stop.lat, stop.lng]} icon={busIcon}>
                    <Popup>
                      <div className="text-sm">
                        <h4 className="font-bold mb-2">🚌 {stop.name}</h4>
                        <p>Código: {stop.code}</p>
                        <p>Dirección: {stop.address}</p>
                        <p>Distrito: {stop.district}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {showMetro && filteredMetroStations.map(station => (
                  <Marker key={`metro-${station.id}`} position={[station.lat, station.lng]} icon={metroIcon}>
                    <Popup>
                      <div className="text-sm">
                        <h4 className="font-bold mb-2">🚇 {station.name}</h4>
                        <p>Líneas: {station.lines.join(', ')}</p>
                        <p>ID: {station.id}</p>
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