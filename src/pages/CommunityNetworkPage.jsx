import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

/**
 * Página de Red de Apoyo Comunitaria
 * Permite reportar zonas peligrosas, ver reportes de otras usuarias y compartir consejos
 */

// Iconos personalizados para diferentes tipos de reportes
const createReportIcon = (type) => {
  const icons = {
    harassment: '😰',
    poor_lighting: '💡',
    isolated: '🏚️',
    suspicious: '👁️',
    safe_zone: '✅'
  };

  const colors = {
    harassment: '#dc2626',
    poor_lighting: '#f59e0b',
    isolated: '#8b5cf6',
    suspicious: '#ef4444',
    safe_zone: '#10b981'
  };

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${colors[type]};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${icons[type]}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export default function CommunityNetworkPage() {
  const [reports, setReports] = useState([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('week'); // 'today', 'week', 'month', 'all'
  const [newReport, setNewReport] = useState({
    type: 'harassment',
    title: '',
    description: '',
    isAnonymous: false
  });

  const barcelonaCenter = [41.3851, 2.1734];

  // Tipos de reportes
  const reportTypes = [
    { id: 'harassment', label: 'Acoso o Comentarios', icon: '😰', color: '#dc2626' },
    { id: 'poor_lighting', label: 'Mala Iluminación', icon: '💡', color: '#f59e0b' },
    { id: 'isolated', label: 'Zona Aislada', icon: '🏚️', color: '#8b5cf6' },
    { id: 'suspicious', label: 'Actividad Sospechosa', icon: '👁️', color: '#ef4444' },
    { id: 'safe_zone', label: 'Zona Segura', icon: '✅', color: '#10b981' }
  ];

  // Cargar ubicación del usuario
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

  // Cargar reportes guardados
  useEffect(() => {
    const savedReports = localStorage.getItem('communityReports');
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    } else {
      // Mock data inicial
      setReports(generateMockReports());
    }
  }, []);

  const generateMockReports = () => {
    return [
      {
        id: 1,
        type: 'harassment',
        title: 'Comentarios inapropiados',
        description: 'Cerca de la estación de metro, dos hombres haciendo comentarios.',
        location: [41.3917, 2.1649],
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isAnonymous: true,
        verifiedCount: 3,
        helpful: 12
      },
      {
        id: 2,
        type: 'poor_lighting',
        title: 'Calle muy oscura',
        description: 'Farolas apagadas en todo el tramo. Muy poca visibilidad.',
        location: [41.3887, 2.1589],
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        isAnonymous: false,
        username: 'María G.',
        verifiedCount: 7,
        helpful: 18
      },
      {
        id: 3,
        type: 'safe_zone',
        title: 'Cafetería abierta 24h',
        description: 'Personal muy amable, zona bien iluminada y segura.',
        location: [41.3851, 2.1734],
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isAnonymous: false,
        username: 'Laura M.',
        verifiedCount: 15,
        helpful: 45
      },
      {
        id: 4,
        type: 'isolated',
        title: 'Pasaje poco transitado',
        description: 'De noche está completamente vacío, mejor evitar.',
        location: [41.3978, 2.1706],
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        isAnonymous: true,
        verifiedCount: 5,
        helpful: 9
      },
      {
        id: 5,
        type: 'suspicious',
        title: 'Personas merodeando',
        description: 'Grupo de personas con actitud sospechosa en el parque.',
        location: [41.3795, 2.1825],
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        isAnonymous: true,
        verifiedCount: 2,
        helpful: 6
      }
    ];
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    
    if (!userLocation || !newReport.title.trim()) {
      alert('⚠️ Por favor completa todos los campos obligatorios');
      return;
    }

    const report = {
      id: Date.now(),
      ...newReport,
      location: userLocation,
      timestamp: new Date().toISOString(),
      verifiedCount: 0,
      helpful: 0,
      username: newReport.isAnonymous ? null : 'Usuaria actual'
    };

    const updatedReports = [report, ...reports];
    setReports(updatedReports);
    localStorage.setItem('communityReports', JSON.stringify(updatedReports));

    // Reset form
    setNewReport({
      type: 'harassment',
      title: '',
      description: '',
      isAnonymous: false
    });
    setShowReportForm(false);

    alert('✅ Reporte enviado. Gracias por contribuir a la seguridad comunitaria!');
  };

  const markAsHelpful = (reportId) => {
    const updated = reports.map(r => 
      r.id === reportId ? { ...r, helpful: r.helpful + 1 } : r
    );
    setReports(updated);
    localStorage.setItem('communityReports', JSON.stringify(updated));
  };

  const verifyReport = (reportId) => {
    const updated = reports.map(r => 
      r.id === reportId ? { ...r, verifiedCount: r.verifiedCount + 1 } : r
    );
    setReports(updated);
    localStorage.setItem('communityReports', JSON.stringify(updated));
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays} días`;
  };

  const filterReportsByTime = (reports) => {
    const now = new Date();
    return reports.filter(report => {
      const reportDate = new Date(report.timestamp);
      const diffDays = (now - reportDate) / (1000 * 60 * 60 * 24);

      switch (timeFilter) {
        case 'today':
          return diffDays < 1;
        case 'week':
          return diffDays < 7;
        case 'month':
          return diffDays < 30;
        default:
          return true;
      }
    });
  };

  const filteredReports = filterReportsByTime(
    activeFilter === 'all' 
      ? reports 
      : reports.filter(r => r.type === activeFilter)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🤝 Red de Apoyo Comunitaria
          </h1>
          <p className="text-gray-600">
            Comparte y consulta reportes de seguridad de la comunidad
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-900">
            💡 <strong>Juntas somos más fuertes.</strong> Comparte información sobre zonas 
            peligrosas o seguras para ayudar a otras mujeres a moverse con confianza.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Report Button */}
            <button
              onClick={() => setShowReportForm(!showReportForm)}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              {showReportForm ? '✖️ Cancelar' : '📝 Crear Reporte'}
            </button>

            {/* Report Form */}
            {showReportForm && (
              <form onSubmit={handleSubmitReport} className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                <h3 className="font-bold text-lg text-gray-900">Nuevo Reporte</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Reporte
                  </label>
                  <select
                    value={newReport.type}
                    onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {reportTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newReport.title}
                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    placeholder="Ej: Calle poco iluminada"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    placeholder="Describe la situación..."
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newReport.isAnonymous}
                      onChange={(e) => setNewReport({ ...newReport, isAnonymous: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Publicar como anónima</span>
                  </label>
                </div>

                {userLocation && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">
                      📍 Ubicación: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  📤 Enviar Reporte
                </button>
              </form>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Filtros</h3>

              {/* Type Filter */}
              <div className="space-y-2 mb-4">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`w-full px-4 py-2 rounded-lg text-left transition ${
                    activeFilter === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  🗂️ Todos los reportes
                </button>
                {reportTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setActiveFilter(type.id)}
                    className={`w-full px-4 py-2 rounded-lg text-left transition flex items-center gap-2 ${
                      activeFilter === type.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span className="flex-1">{type.label}</span>
                    <span className="text-xs opacity-75">
                      {reports.filter(r => r.type === type.id).length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Time Filter */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Período</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'today', label: 'Hoy' },
                    { id: 'week', label: 'Esta semana' },
                    { id: 'month', label: 'Este mes' },
                    { id: 'all', label: 'Todos' }
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setTimeFilter(filter.id)}
                      className={`px-3 py-2 rounded-lg text-sm transition ${
                        timeFilter === filter.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4">📊 Estadísticas</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total reportes:</span>
                  <span className="font-bold">{reports.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Filtrados:</span>
                  <span className="font-bold">{filteredReports.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Últimas 24h:</span>
                  <span className="font-bold">
                    {reports.filter(r => (new Date() - new Date(r.timestamp)) < 86400000).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '700px' }}>
              {userLocation && (
                <MapContainer 
                  center={userLocation} 
                  zoom={14} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />

                  {/* User location */}
                  <Marker position={userLocation}>
                    <Popup>
                      <strong>📍 Tu ubicación</strong>
                    </Popup>
                  </Marker>

                  {/* Reports */}
                  {filteredReports.map(report => (
                    <Marker
                      key={report.id}
                      position={report.location}
                      icon={createReportIcon(report.type)}
                    >
                      <Popup>
                        <div className="text-sm max-w-xs">
                          <div className="font-bold text-base mb-2">{report.title}</div>
                          <p className="text-gray-700 mb-2">{report.description}</p>
                          <div className="text-xs text-gray-600 mb-2">
                            {report.isAnonymous ? '🔒 Anónimo' : `👤 ${report.username}`}
                            <br />
                            ⏰ {getTimeAgo(report.timestamp)}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => verifyReport(report.id)}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                            >
                              ✓ Verificar ({report.verifiedCount})
                            </button>
                            <button
                              onClick={() => markAsHelpful(report.id)}
                              className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                            >
                              👍 Útil ({report.helpful})
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Safety zones circle */}
                  {filteredReports.filter(r => r.type === 'safe_zone').map(report => (
                    <Circle
                      key={`circle-${report.id}`}
                      center={report.location}
                      radius={200}
                      pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1 }}
                    />
                  ))}
                </MapContainer>
              )}
            </div>

            {/* Recent Reports List */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                📋 Reportes Recientes ({filteredReports.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredReports.slice(0, 10).map(report => {
                  const typeInfo = reportTypes.find(t => t.id === report.type);
                  return (
                    <div
                      key={report.id}
                      className="border-l-4 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                      style={{ borderColor: typeInfo.color }}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{typeInfo.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{report.title}</div>
                          <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{getTimeAgo(report.timestamp)}</span>
                            <span>✓ {report.verifiedCount} verificaciones</span>
                            <span>👍 {report.helpful} útiles</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4">
            📝 Guía de Uso de la Red Comunitaria
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">✅ Qué reportar:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Situaciones de acoso o comentarios inapropiados</li>
                <li>• Zonas con mala iluminación o poco transitadas</li>
                <li>• Actividades sospechosas o potencialmente peligrosas</li>
                <li>• Lugares seguros (cafeterías, tiendas abiertas, etc.)</li>
                <li>• Cambios en la infraestructura que afecten la seguridad</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">⚠️ Recomendaciones:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Sé específica pero no incluyas datos personales</li>
                <li>• Verifica reportes que puedas confirmar</li>
                <li>• Actualiza si la situación cambia</li>
                <li>• Respeta la privacidad de todas</li>
                <li>• En emergencia real, llama al 112 o 016</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
