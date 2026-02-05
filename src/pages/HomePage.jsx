import React, { useState } from 'react';

export default function HomePage({ setActivePage }) {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // Mock data de ciudades (en una app real vendría de los CSVs)
  const cities = [
    'Barcelona',
    'Tarragona',
    'Lleida',
    'Girona',
    'Sabadell',
    'Terrassa',
    'Badalona',
    'Hospitalet de Llobregat',
    'Mataró',
    'Reus'
  ];

  // Mock data de distritos de Barcelona
  const districtsBarcelona = [
    'Ciutat Vella',
    'Eixample',
    'Sants-Montjuïc',
    'Les Corts',
    'Sarrià-Sant Gervasi',
    'Gràcia',
    'Horta-Guinardó',
    'Nou Barris',
    'Sant Andreu',
    'Sant Martí'
  ];

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setSelectedDistrict('');
  };

  const handleVerMapa = () => {
    setActivePage('mapa');
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Ciudades más seguras y habitables para todas
            </h2>
            <p className="text-lg md:text-xl text-primary-100 leading-relaxed">
              Análisis basado en datos abiertos sobre equipamientos, transporte, 
              iluminación y actividad cultural en Catalunya
            </p>
          </div>
        </div>
      </section>

      {/* City Selector Section */}
      <section className="py-16">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Selector Card */}
            <div className="card p-8">
              <h3 className="text-2xl font-serif font-semibold mb-3">Explora tu ciudad</h3>
              <p className="text-gray-600 mb-6">
                Selecciona una ciudad de Catalunya para ver el análisis de movilidad segura
              </p>

              {/* City Select */}
              <div className="mb-6">
                <label htmlFor="ciudad-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <select
                  id="ciudad-select"
                  value={selectedCity}
                  onChange={handleCityChange}
                  className="select-input"
                >
                  <option value="">Selecciona una ciudad</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* District Select */}
              <div className="mb-6">
                <label htmlFor="distrito-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Distrito / Barrio
                </label>
                <select
                  id="distrito-select"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={selectedCity !== 'Barcelona'}
                  className="select-input disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedCity === 'Barcelona' ? 'Selecciona un distrito' : 'Selecciona primero una ciudad'}
                  </option>
                  {selectedCity === 'Barcelona' && districtsBarcelona.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              {/* Ver Mapa Button */}
              <button
                onClick={handleVerMapa}
                disabled={!selectedCity}
                className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ver mapa y análisis
              </button>
            </div>

            {/* Info Cards */}
            <div className="space-y-4">
              <div className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 text-4xl">📍</div>
                  <div>
                    <h4 className="font-serif font-semibold text-lg mb-2">Equipamientos</h4>
                    <p className="text-gray-600 text-sm">
                      Visualiza centros cívicos, bibliotecas y servicios públicos
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 text-4xl">🚌</div>
                  <div>
                    <h4 className="font-serif font-semibold text-lg mb-2">Transporte</h4>
                    <p className="text-gray-600 text-sm">
                      Analiza accesibilidad y conexiones de transporte público
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 text-4xl">🎭</div>
                  <div>
                    <h4 className="font-serif font-semibold text-lg mb-2">Actividad Cultural</h4>
                    <p className="text-gray-600 text-sm">
                      Espacios culturales y de ocio que dinamizan el territorio
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">
            Fuentes de Datos Abiertos
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Equipamientos Culturales */}
            <div className="card p-6">
              <h3 className="font-serif font-semibold text-lg mb-3">Equipamientos Culturales</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong className="text-gray-900">Font:</strong> Generalitat de Catalunya</p>
                <p><strong className="text-gray-900">Dataset:</strong> Equipaments culturals de Catalunya</p>
                <p className="text-primary-600 font-mono text-xs">
                  analisi.transparenciacatalunya.cat
                </p>
              </div>
            </div>

            {/* Transport TMB */}
            <div className="card p-6">
              <h3 className="font-serif font-semibold text-lg mb-3">Transport TMB</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong className="text-gray-900">Font:</strong> Ajuntament de Barcelona</p>
                <p><strong className="text-gray-900">Dataset:</strong> Parades i estacions TMB</p>
                <p className="text-primary-600 font-mono text-xs">
                  opendata-ajuntament.barcelona.cat
                </p>
              </div>
            </div>

            {/* Dades Culturals */}
            <div className="card p-6">
              <h3 className="font-serif font-semibold text-lg mb-3">Dades Culturals</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong className="text-gray-900">Font:</strong> Barcelona Dades Cultura</p>
                <p><strong className="text-gray-900">Dataset:</strong> Equipaments i activitat cultural</p>
                <p className="text-primary-600 font-mono text-xs">
                  barcelonadadescultura.bcn.cat
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
