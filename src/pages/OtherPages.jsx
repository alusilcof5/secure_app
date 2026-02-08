import React from 'react';

/**
 * Página de Datos - Información sobre fuentes de datos abiertos
 */
export function DatosPage() {
  const dataSources = [
    {
      id: 1,
      categoria: 'Equipamientos Culturales',
      fuente: 'Generalitat de Catalunya',
      dataset: 'Equipaments culturals de Catalunya',
      url: 'https://analisi.transparenciacatalunya.cat/',
      icono: '🏛️',
      descripcion: 'Información completa sobre bibliotecas, centros cívicos, teatros y espacios culturales en Catalunya.',
      registros: '2,500+',
      actualizacion: 'Mensual'
    },
    {
      id: 2,
      categoria: 'Transporte Público - TMB',
      fuente: 'Ajuntament de Barcelona',
      dataset: 'Parades i estacions TMB',
      url: 'https://opendata-ajuntament.barcelona.cat/ca',
      icono: '🚌',
      descripcion: 'Datos en tiempo real de autobuses, metro y FGC. Incluye paradas, horarios y ocupación.',
      registros: '1,500+',
      actualizacion: 'Tiempo real'
    },
    {
      id: 3,
      categoria: 'Bicing Barcelona',
      fuente: 'TMB Barcelona',
      dataset: 'Estaciones y disponibilidad Bicing',
      url: 'https://www.bicing.barcelona/',
      icono: '🚲',
      descripcion: 'Red de bicicletas compartidas con disponibilidad en tiempo real de bicis mecánicas y eléctricas.',
      registros: '500+',
      actualizacion: 'Tiempo real'
    },
    {
      id: 4,
      categoria: 'Actividad Cultural',
      fuente: 'Barcelona Dades Cultura',
      dataset: 'Equipaments i activitat cultural',
      url: 'https://barcelonadadescultura.bcn.cat/',
      icono: '🎭',
      descripcion: 'Agenda cultural, eventos, exposiciones y actividades en espacios públicos de Barcelona.',
      registros: '5,000+',
      actualizacion: 'Diaria'
    },
    {
      id: 5,
      categoria: 'Seguridad y Emergencias',
      fuente: 'Mossos d\'Esquadra / Guàrdia Urbana',
      dataset: 'Datos de seguridad ciudadana',
      url: 'https://mossos.gencat.cat/ca/inici/',
      icono: '🚔',
      descripcion: 'Estadísticas de seguridad, ubicación de comisarías y servicios de emergencia.',
      registros: '200+',
      actualizacion: 'Trimestral'
    },
    {
      id: 6,
      categoria: 'Iluminación Urbana',
      fuente: 'Ajuntament de Barcelona',
      dataset: 'Inventario de iluminación pública',
      url: 'https://opendata-ajuntament.barcelona.cat/ca',
      icono: '💡',
      descripcion: 'Mapa de farolas, tipo de iluminación LED, intensidad y horarios de funcionamiento.',
      registros: '150,000+',
      actualizacion: 'Anual'
    }
  ];

  const metodologia = [
    {
      paso: '1',
      titulo: 'Recopilación',
      descripcion: 'Descarga de datasets oficiales desde portales de datos abiertos',
      icono: '📥'
    },
    {
      paso: '2',
      titulo: 'Procesamiento',
      descripcion: 'Limpieza y normalización de datos usando Python/JavaScript',
      icono: '⚙️'
    },
    {
      paso: '3',
      titulo: 'Geolocalización',
      descripcion: 'Conversión de direcciones a coordenadas GPS para mapas',
      icono: '📍'
    },
    {
      paso: '4',
      titulo: 'Análisis',
      descripcion: 'Cálculo de índices de seguridad basados en múltiples variables',
      icono: '📊'
    },
    {
      paso: '5',
      titulo: 'Visualización',
      descripcion: 'Presentación interactiva en mapas y gráficos',
      icono: '🗺️'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold mb-3">📊 Fuentes de Datos Abiertos</h1>
          <p className="text-lg text-primary-100">
            Transparencia total: Todos los datos provienen de fuentes oficiales y públicas
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Intro */}
        <div className="card p-8 mb-12">
          <div className="flex items-start space-x-4">
            <div className="text-5xl">🔓</div>
            <div>
              <h2 className="text-2xl font-serif font-bold mb-3">Compromiso con los Datos Abiertos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Camina Segura</strong> se construye sobre la filosofía de datos abiertos y transparencia. 
                Todos los datos utilizados en nuestra plataforma provienen de fuentes oficiales de las 
                administraciones públicas catalanas y están disponibles para cualquier ciudadana.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Creemos que la información pública debe ser accesible, comprensible y útil para mejorar 
                la calidad de vida de todas las personas.
              </p>
            </div>
          </div>
        </div>

        {/* Fuentes de Datos */}
        <div className="mb-12">
          <h2 className="text-3xl font-serif font-bold mb-6">🗂️ Nuestras Fuentes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {dataSources.map(source => (
              <div key={source.id} className="card p-6 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{source.icono}</div>
                  <div className="flex gap-2">
                    <span className="badge badge-info text-xs">{source.registros}</span>
                    <span className="badge badge-success text-xs">{source.actualizacion}</span>
                  </div>
                </div>
                
                <h3 className="font-serif font-bold text-xl mb-2">{source.categoria}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-20">Fuente:</span>
                    <span className="font-semibold text-gray-800">{source.fuente}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-20">Dataset:</span>
                    <span className="text-gray-700">{source.dataset}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {source.descripcion}
                </p>
                
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Visitar fuente oficial
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Metodología */}
        <div className="mb-12">
          <h2 className="text-3xl font-serif font-bold mb-6">🔬 Nuestra Metodología</h2>
          <div className="card p-8">
            <p className="text-gray-700 mb-6 leading-relaxed">
              El proceso de transformar datos abiertos en información útil para la seguridad urbana 
              sigue un riguroso pipeline de cinco fases:
            </p>
            
            <div className="space-y-4">
              {metodologia.map((item, index) => (
                <div key={item.paso} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {item.paso}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{item.icono}</span>
                      <h3 className="font-semibold text-lg">{item.titulo}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{item.descripcion}</p>
                  </div>
                  {index < metodologia.length - 1 && (
                    <div className="hidden md:block text-gray-300 text-2xl">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mb-12">
          <h2 className="text-3xl font-serif font-bold mb-6">📈 Datos en Números</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="card p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-4xl font-bold text-blue-600 mb-2">160,000+</div>
              <div className="text-sm text-gray-700">Registros procesados</div>
            </div>
            <div className="card p-6 text-center bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-4xl font-bold text-green-600 mb-2">6</div>
              <div className="text-sm text-gray-700">Fuentes oficiales</div>
            </div>
            <div className="card p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="text-4xl font-bold text-purple-600 mb-2">Real-time</div>
              <div className="text-sm text-gray-700">Actualización TMB</div>
            </div>
            <div className="card p-6 text-center bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="text-4xl font-bold text-orange-600 mb-2">100%</div>
              <div className="text-sm text-gray-700">Datos públicos</div>
            </div>
          </div>
        </div>

        {/* Cálculo de Seguridad */}
        <div className="card p-8 mb-12">
          <h2 className="text-3xl font-serif font-bold mb-6">🧮 ¿Cómo calculamos la seguridad?</h2>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            El <strong>índice de seguridad</strong> de cada zona es un cálculo ponderado que combina 
            múltiples variables objetivas:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">✅ Factores Positivos</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span><strong>Iluminación LED:</strong> Más luz = más seguridad (peso 25%)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span><strong>Densidad de equipamientos:</strong> Centros cívicos, bibliotecas (peso 20%)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span><strong>Acceso a transporte:</strong> Paradas y estaciones cercanas (peso 15%)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span><strong>Actividad cultural:</strong> Eventos y dinamización social (peso 10%)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span><strong>Proximidad a comisarías:</strong> Servicios de seguridad (peso 15%)</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-3">⚠️ Factores Negativos</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span><strong>Zonas poco iluminadas:</strong> Escasa densidad de farolas (peso -20%)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span><strong>Bajo tráfico peatonal:</strong> Calles poco transitadas de noche (peso -15%)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span><strong>Reportes de incidentes:</strong> Datos históricos de la Guàrdia Urbana (peso -30%)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span><strong>Puntos ciegos:</strong> Zonas sin cobertura de cámaras (peso -10%)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm text-blue-800">
              <strong>💡 Nota metodológica:</strong> Los pesos pueden ajustarse según feedback de usuarias 
              y datos empíricos. Nuestro objetivo es refinar continuamente el algoritmo para que sea 
              cada vez más preciso.
            </p>
          </div>
        </div>

        {/* Contribuye */}
        <div className="card p-8 bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="flex items-start space-x-4">
            <div className="text-5xl">🤝</div>
            <div>
              <h2 className="text-2xl font-serif font-bold mb-3">¿Conoces otras fuentes de datos?</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Estamos siempre buscando nuevas fuentes de datos abiertos que nos ayuden a mejorar 
                la seguridad urbana. Si conoces algún dataset relevante o tienes sugerencias, 
                nos encantaría escucharte.
              </p>
              <a 
                href="mailto:alusilvacordoba@gmail.com?subject=Sugerencia de datos para Camina Segura"
                className="btn btn-primary"
              >
                Enviar sugerencia
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Página de Acerca de / Sobre el Proyecto
 */
export function AcercaDePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold mb-3">💜 Acerca de Camina Segura</h1>
          <p className="text-lg text-primary-100">
            Nuestra misión, visión y el equipo detrás del proyecto
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="card p-8 mb-8">
          <h2 className="text-3xl font-serif font-bold mb-4">🎯 Nuestra Misión</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Crear ciudades más seguras y habitables para todas las mujeres a través del análisis 
            de datos abiertos y herramientas tecnológicas accesibles.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-8">
            <h3 className="text-2xl font-serif font-bold mb-4">🌟 Visión</h3>
            <p className="text-gray-700 leading-relaxed">
              Un futuro donde todas las mujeres puedan moverse libremente por sus ciudades, 
              sin miedo, con acceso a información que las empodere para tomar las mejores 
              decisiones sobre sus desplazamientos.
            </p>
          </div>

          <div className="card p-8">
            <h3 className="text-2xl font-serif font-bold mb-4">❤️ Valores</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Transparencia total</li>
              <li>• Privacidad y seguridad primero</li>
              <li>• Accesibilidad para todas</li>
              <li>• Basado en datos verificables</li>
              <li>• Código abierto y colaborativo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default { DatosPage, AcercaDePage };