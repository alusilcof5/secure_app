import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">CS</span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg">Camina Segura</h3>
                <p className="text-xs text-gray-400">Catalunya</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Promoviendo ciudades más seguras y habitables para todas las mujeres a través del análisis de datos abiertos.
            </p>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="font-semibold mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  🏠 Inicio
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  🗺️ Mapa Interactivo
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  🛡️ Centro de Seguridad
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  🚌 Transporte
                </a>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://mossos.gencat.cat/ca/inici/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition"
                >
                  🚔 Mossos d'Esquadra
                </a>
              </li>
              <li>
                <a 
                  href="https://ajuntament.barcelona.cat/guardiaurbana/ca" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition"
                >
                  👮 Guàrdia Urbana
                </a>
              </li>
              <li>
                <a 
                  href="https://dones.gencat.cat/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition"
                >
                  💜 Institut Català de les Dones
                </a>
              </li>
              <li>
                <a 
                  href="tel:900900120" 
                  className="text-gray-400 hover:text-white transition"
                >
                  📞 Atención Violencia (900 900 120)
                </a>
              </li>
            </ul>
          </div>

          {/* Datos Abiertos */}
          <div>
            <h4 className="font-semibold mb-4">Fuentes de Datos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://opendata-ajuntament.barcelona.cat/ca" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition"
                >
                  📊 Open Data BCN
                </a>
              </li>
              <li>
                <a 
                  href="https://analisi.transparenciacatalunya.cat/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition"
                >
                  🏛️ Dades Obertes Catalunya
                </a>
              </li>
              <li>
                <a 
                  href="https://developer.tmb.cat/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition"
                >
                  🚇 API TMB
                </a>
              </li>
              <li>
                <a 
                  href="https://www.bicing.barcelona/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition"
                >
                  🚲 Bicing Barcelona
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div className="mb-4 md:mb-0">
            <p>
              © {currentYear} <strong className="text-white">Camina Segura</strong>. 
              Desarrollado con 💜 para mejorar la seguridad urbana.
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-white transition">
              Privacidad
            </a>
            <a href="#" className="hover:text-white transition">
              Términos
            </a>
            <a href="#" className="hover:text-white transition">
              Contacto
            </a>
          </div>
        </div>

        {/* Emergencia Footer Badge */}
        <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <span className="text-red-400">🆘 Emergencias:</span>
            <a href="tel:112" className="font-bold text-white hover:text-red-300 transition">
              112 (General)
            </a>
            <span className="text-gray-500">|</span>
            <a href="tel:016" className="font-bold text-white hover:text-red-300 transition">
              016 (Violencia de Género)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}