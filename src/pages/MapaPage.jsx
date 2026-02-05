import React, { useState, useEffect } from 'react';
import MapComponent from '../components/MapComponent';
import MapFilters from '../components/MapFilters';
import { loadAllData } from '../services/dataService';

export default function MapaPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    types: ['cultural', 'restaurant', 'info', 'equipament'],
    district: '',
    search: ''
  });
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allData = await loadAllData();
        setData(allData);
      
        const newStats = {
          cultural: allData.cultural.length,
          restaurant: allData.restaurants.length,
          info: allData.infoCenters.length,
          equipament: allData.equipaments.length
        };
        setStats(newStats);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const getFilteredData = () => {
    if (!data) return [];
    
    let filtered = data.all;

    if (filters.types.length > 0) {
      filtered = filtered.filter(item => filters.types.includes(item.type));
    }

    if (filters.district) {
      filtered = filtered.filter(item =>
        item.district === filters.district || item.municipality === filters.district
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const filteredData = getFilteredData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
          <h2 className="text-xl font-serif font-semibold text-gray-900 mb-2">
            Cargando datos de equipamientos...
          </h2>
          <p className="text-gray-600">
            Esto puede tardar unos segundos
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-serif font-semibold mb-3 text-red-600">
            Error al cargar datos
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header de la página */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-6">
        <div className="container">
          <h2 className="text-3xl font-serif font-bold mb-2">
            Mapa de Equipamientos
          </h2>
          <p className="text-primary-100">
            Explora equipamientos culturales, restaurantes y servicios de Barcelona y Catalunya
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-grow flex overflow-hidden">
        <div className="container flex gap-6 py-6 h-full">
          {/* Sidebar con filtros */}
          <aside className="w-80 flex-shrink-0 overflow-y-auto">
            <MapFilters
              filters={filters}
              setFilters={setFilters}
              stats={stats}
            />

            {/* Información del marcador seleccionado */}
            {selectedMarker && (
              <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-serif font-semibold text-lg mb-3">
                  Seleccionado
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-gray-900">{selectedMarker.name}</p>
                  <p className="text-gray-600">{selectedMarker.category}</p>
                  {selectedMarker.address && (
                    <p className="text-gray-600">{selectedMarker.address}</p>
                  )}
                  {selectedMarker.district && (
                    <p className="text-gray-600">
                      <strong>Distrito:</strong> {selectedMarker.district}
                    </p>
                  )}
                  {selectedMarker.phone && (
                    <p className="text-gray-600">
                      <strong>Tel:</strong> {selectedMarker.phone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </aside>

          {/* Mapa */}
          <main className="flex-grow relative">
            <div className="h-full bg-white rounded-xl shadow-sm overflow-hidden">
              <MapComponent
                data={filteredData}
                filters={filters}
                onMarkerClick={setSelectedMarker}
              />
            </div>

            {/* Contador de resultados */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md px-4 py-2 z-[1000]">
              <p className="text-sm font-medium text-gray-900">
                {filteredData.length} {filteredData.length === 1 ? 'lugar' : 'lugares'} encontrados
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
