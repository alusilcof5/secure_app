import React from 'react';

export default function MapFilters({ filters, setFilters, stats }) {
  const toggleType = (type) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const filterTypes = [
    { id: 'cultural', label: 'Equipamientos Culturales', icon: '🎭', color: '#ff6b9d' },
    { id: 'restaurant', label: 'Restaurantes', icon: '🍽️', color: '#ffa500' },
    { id: 'info', label: 'Centros de Información', icon: 'ℹ️', color: '#4ecdc4' },
    { id: 'equipament', label: 'Equipamientos Catalunya', icon: '🏛️', color: '#7b68ee' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      {/* Búsqueda */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          Buscar por nombre
        </label>
        <input
          type="text"
          id="search"
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          placeholder="Ej: biblioteca, museo..."
          className="input-field"
        />
      </div>

      {/* Filtros por tipo */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Tipo de equipamiento</h3>
        <div className="space-y-2">
          {filterTypes.map(type => (
            <label
              key={type.id}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={filters.types.includes(type.id)}
                onChange={() => toggleType(type.id)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: type.color }}
              />
              <span className="text-2xl">{type.icon}</span>
              <div className="flex-grow">
                <div className="text-sm font-medium text-gray-900">{type.label}</div>
                {stats && (
                  <div className="text-xs text-gray-500">
                    {stats[type.id] || 0} lugares
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Filtro por distrito */}
      <div>
        <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
          Distrito / Municipio
        </label>
        <select
          id="district"
          value={filters.district}
          onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
          className="select-input"
        >
          <option value="">Todos los distritos</option>
          <optgroup label="Barcelona">
            <option value="Ciutat Vella">Ciutat Vella</option>
            <option value="Eixample">Eixample</option>
            <option value="Sants-Montjuïc">Sants-Montjuïc</option>
            <option value="Les Corts">Les Corts</option>
            <option value="Sarrià-Sant Gervasi">Sarrià-Sant Gervasi</option>
            <option value="Gràcia">Gràcia</option>
            <option value="Horta-Guinardó">Horta-Guinardó</option>
            <option value="Nou Barris">Nou Barris</option>
            <option value="Sant Andreu">Sant Andreu</option>
            <option value="Sant Martí">Sant Martí</option>
          </optgroup>
        </select>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Estadísticas</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total visible:</span>
              <span className="font-semibold text-gray-900">
                {Object.values(stats).reduce((a, b) => a + b, 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botón limpiar filtros */}
      <button
        onClick={() => setFilters({ types: [], district: '', search: '' })}
        className="btn btn-secondary w-full text-sm"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
