import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  calculateSafeRoutes, 
  getRouteRecommendations, 
  saveRouteToHistory,
  getRouteStatistics 
} from '../services/safeRoutingService';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapController({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  
  return null;
}

export default function SafeRoutesPage() {
  const [step, setStep] = useState('input'); 
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [mapCenter, setMapCenter] = useState([41.3874, 2.1686]);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [statistics, setStatistics] = useState(null);

  
  useEffect(() => {
    const stats = getRouteStatistics();
    setStatistics(stats);
  }, [routes]);

  const getCurrentLocation = () => {
    setUseCurrentLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setStartLocation(location);
          setStartAddress('Mi ubicación actual');
          setMapCenter([location.lat, location.lng]);
          setUseCurrentLocation(false);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          alert('No se pudo obtener tu ubicación. Marca un punto en el mapa.');
          setUseCurrentLocation(false);
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización');
      setUseCurrentLocation(false);
    }
  };

  
  const handleMapClick = (e) => {
    const location = {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    };

    if (!startLocation) {
      setStartLocation(location);
      setStartAddress(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
    } else if (!endLocation) {
      setEndLocation(location);
      setEndAddress(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
    } else {
     
      setStartLocation(location);
      setStartAddress(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
      setEndLocation(null);
      setEndAddress('');
    }
  };

 
  const handleCalculateRoutes = () => {
    if (!startLocation || !endLocation) {
      alert('Por favor selecciona punto de inicio y destino');
      return;
    }

    setStep('calculating');

    
    setTimeout(() => {
      const calculatedRoutes = calculateSafeRoutes(
        { ...startLocation, address: startAddress },
        { ...endLocation, address: endAddress }
      );
      
      setRoutes(calculatedRoutes);
      setSelectedRoute(calculatedRoutes[0]); 
      setStep('results');

      if (calculatedRoutes.length > 0) {
        const midLat = (startLocation.lat + endLocation.lat) / 2;
        const midLng = (startLocation.lng + endLocation.lng) / 2;
        setMapCenter([midLat, midLng]);
      }
    }, 1000);
  };


  const handleConfirmRoute = () => {
    if (selectedRoute) {
      saveRouteToHistory(
        selectedRoute, 
        { ...startLocation, address: startAddress },
        { ...endLocation, address: endAddress }
      );
      
      alert(`✅ Ruta "${selectedRoute.name}" guardada. ¡Mantente segura!`);
      
      
      const stats = getRouteStatistics();
      setStatistics(stats);
    }
  };

  
  const handleReset = () => {
    setStep('input');
    setStartLocation(null);
    setEndLocation(null);
    setStartAddress('');
    setEndAddress('');
    setRoutes([]);
    setSelectedRoute(null);
    setMapCenter([41.3874, 2.1686]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            🗺️ Rutas Seguras
          </h1>
          <p className="text-gray-600 text-lg">
            Planifica tu trayecto optimizado por seguridad
          </p>
        </div>

        {/* Estadísticas  */}
        {statistics && step === 'input' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Tus Estadísticas de Rutas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{statistics.totalRoutes}</div>
                <div className="text-sm text-gray-600">Rutas calculadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{statistics.avgSafetyScore}</div>
                <div className="text-sm text-gray-600">Score promedio</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{statistics.totalDistance} km</div>
                <div className="text-sm text-gray-600">Distancia total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{statistics.safeRoutesPercentage}%</div>
                <div className="text-sm text-gray-600">Rutas seguras</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Panel izquierdo */}
          <div className="space-y-6">
            {/* Input de ubicaciones */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {step === 'input' ? '📍 Selecciona Ubicaciones' : step === 'calculating' ? '⏳ Calculando...' : '✅ Rutas Calculadas'}
              </h2>

              {step === 'input' && (
                <div className="space-y-4">
                  {/* Inicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Punto de Inicio
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={startAddress}
                        onChange={(e) => setStartAddress(e.target.value)}
                        placeholder="Haz click en el mapa o usa GPS"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        readOnly
                      />
                      <button
                        onClick={getCurrentLocation}
                        disabled={useCurrentLocation}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                      >
                        {useCurrentLocation ? '⏳' : '📍'} GPS
                      </button>
                    </div>
                    {startLocation && (
                      <div className="mt-1 text-xs text-green-600">
                        ✓ Ubicación seleccionada
                      </div>
                    )}
                  </div>

                  {/* Destino */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destino
                    </label>
                    <input
                      type="text"
                      value={endAddress}
                      onChange={(e) => setEndAddress(e.target.value)}
                      placeholder="Haz click en el mapa"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      readOnly
                    />
                    {endLocation && (
                      <div className="mt-1 text-xs text-green-600">
                        ✓ Destino seleccionado
                      </div>
                    )}
                  </div>

                  {/* Instrucciones */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-900">
                      💡 <strong>Cómo usar:</strong> Haz click en el mapa para marcar tu inicio y destino. 
                      O usa el botón GPS para tu ubicación actual.
                    </p>
                  </div>

                  {/* Botón calcular */}
                  <button
                    onClick={handleCalculateRoutes}
                    disabled={!startLocation || !endLocation}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🚀 Calcular Rutas Seguras
                  </button>
                </div>
              )}

              {step === 'calculating' && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Analizando datos de seguridad...</p>
                  <p className="text-sm text-gray-500 mt-2">Evaluando reportes de la comunidad, iluminación y más</p>
                </div>
              )}

              {step === 'results' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {startAddress.substring(0, 25)}... → {endAddress.substring(0, 25)}...
                    </span>
                    <button
                      onClick={handleReset}
                      className="text-sm text-purple-600 hover:text-purple-800"
                    >
                      🔄 Nueva ruta
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Opciones de rutas */}
            {step === 'results' && routes.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🛣️ Opciones de Ruta</h3>
                
                <div className="space-y-3">
                  {routes.map(route => (
                    <div
                      key={route.id}
                      onClick={() => setSelectedRoute(route)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedRoute?.id === route.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{route.icon}</span>
                          <div>
                            <h4 className="font-semibold text-gray-900">{route.name}</h4>
                            {route.recommended && (
                              <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                ✓ Recomendada
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`text-2xl font-bold ${
                          route.safetyScore >= 70 ? 'text-green-600' :
                          route.safetyScore >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {route.safetyScore}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{route.description}</p>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="text-gray-500">Distancia</div>
                          <div className="font-semibold">{route.distance.toFixed(1)} km</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Tiempo</div>
                          <div className="font-semibold">{route.estimatedTime.minutes} min</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Seguridad</div>
                          <div className="font-semibold">
                            {route.safetyScore >= 70 ? '✅ Alta' :
                             route.safetyScore >= 50 ? '⚠️ Media' :
                             '🚨 Baja'}
                          </div>
                        </div>
                      </div>

                      {route.dangerousPoints.length > 0 && (
                        <div className="mt-2 text-xs text-red-600">
                          ⚠️ {route.dangerousPoints.length} punto(s) de riesgo detectados
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Botón confirmar */}
                {selectedRoute && (
                  <button
                    onClick={handleConfirmRoute}
                    className="w-full mt-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                  >
                    ✅ Usar esta ruta
                  </button>
                )}
              </div>
            )}

            {/* Recomendaciones */}
            {step === 'results' && selectedRoute && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">💡 Recomendaciones</h3>
                  <button
                    onClick={() => setShowRecommendations(!showRecommendations)}
                    className="text-sm text-purple-600"
                  >
                    {showRecommendations ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>

                {showRecommendations && (
                  <div className="space-y-3">
                    {getRouteRecommendations(selectedRoute).map((rec, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border-l-4 ${
                          rec.priority === 'high' ? 'bg-red-50 border-red-500' :
                          rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                          'bg-green-50 border-green-500'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xl">{rec.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{rec.message}</p>
                            {rec.action && (
                              <button className="mt-1 text-xs text-purple-600 hover:underline">
                                {rec.action} →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {getRouteRecommendations(selectedRoute).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        ✅ Sin recomendaciones especiales. ¡Ruta segura!
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Panel derecho - Mapa */}
          <div className="bg-white rounded-xl shadow-lg p-4 h-[600px]">
            <MapContainer
              center={mapCenter}
              zoom={13}
              className="h-full w-full rounded-lg"
              onClick={step === 'input' ? handleMapClick : undefined}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              
              <MapController center={step === 'results' ? mapCenter : null} />

              {/* Marcador de inicio */}
              {startLocation && (
                <Marker position={[startLocation.lat, startLocation.lng]}>
                  <Popup>
                    <strong>📍 Inicio</strong><br />
                    {startAddress}
                  </Popup>
                </Marker>
              )}

              {/* Marcador de destino */}
              {endLocation && (
                <Marker position={[endLocation.lat, endLocation.lng]}>
                  <Popup>
                    <strong>🎯 Destino</strong><br />
                    {endAddress}
                  </Popup>
                </Marker>
              )}

              {/* Rutas calculadas */}
              {step === 'results' && routes.map(route => (
                <React.Fragment key={route.id}>
                  <Polyline
                    positions={route.waypoints.map(wp => [wp.lat, wp.lng])}
                    color={selectedRoute?.id === route.id ? route.color : '#cccccc'}
                    weight={selectedRoute?.id === route.id ? 5 : 2}
                    opacity={selectedRoute?.id === route.id ? 0.8 : 0.3}
                  />
                  
                  {/* Puntos peligrosos */}
                  {selectedRoute?.id === route.id && route.dangerousPoints.map((point, idx) => (
                    <Circle
                      key={`danger-${idx}`}
                      center={[point.lat, point.lng]}
                      radius={50}
                      fillColor={point.severity === 'high' ? '#dc2626' : '#f59e0b'}
                      fillOpacity={0.3}
                      color={point.severity === 'high' ? '#dc2626' : '#f59e0b'}
                      weight={2}
                    >
                      <Popup>
                        <strong>⚠️ Zona de Riesgo</strong><br />
                        Nivel: {point.severity === 'high' ? 'Alto' : 'Medio'}<br />
                        Score: {Math.round(point.safetyScore)}
                      </Popup>
                    </Circle>
                  ))}
                </React.Fragment>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">🛡️</div>
              <div className="font-semibold mb-1">Algoritmo Inteligente</div>
              <div className="text-sm text-purple-100">
                Analiza reportes comunitarios, evaluaciones históricas y hora del día
              </div>
            </div>
            <div>
              <div className="text-3xl mb-2">🗺️</div>
              <div className="font-semibold mb-1">3 Opciones Siempre</div>
              <div className="text-sm text-purple-100">
                Elige entre ruta más segura, más rápida o equilibrada
              </div>
            </div>
            <div>
              <div className="text-3xl mb-2">📊</div>
              <div className="font-semibold mb-1">Mejora Continua</div>
              <div className="text-sm text-purple-100">
                Cada ruta usada mejora las recomendaciones futuras
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
