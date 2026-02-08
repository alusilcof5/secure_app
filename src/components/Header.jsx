import React, { useState } from 'react';

export default function Header({ activePage, setActivePage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: '🏠' },
    {
      id: 'seguridad',
      label: 'Seguridad',
      icon: '🛡️',
      submenu: [
        { id: 'evaluacion', label: 'Evaluación de Riesgo', icon: '📊' },
        { id: 'rutas', label: 'Rutas Seguras', icon: '🗺️' },
        { id: 'simulador', label: 'Herramientas SOS', icon: '🚨' },
        { id: 'analisis', label: 'Mi Análisis', icon: '📈' }
      ]
    },
    { id: 'comunidad', label: 'Red Comunitaria', icon: '🤝' },
    { id: 'mapa', label: 'Equipamientos', icon: '🗺️' },
    { id: 'transporte', label: 'Transporte', icon: '🚌' },
    { id: 'datos', label: 'Datos Abiertos', icon: '📁' }
  ];

  const [openSubmenu, setOpenSubmenu] = useState(null);

  const handleNavClick = (item) => {
    if (item.submenu) {
      setOpenSubmenu(openSubmenu === item.id ? null : item.id);
    } else {
      setActivePage(item.id);
      setMobileMenuOpen(false);
      setOpenSubmenu(null);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => {
              setActivePage('inicio');
              setMobileMenuOpen(false);
              setOpenSubmenu(null);
            }}
          >
            <span className="text-3xl">🌸</span>
            <div>
              <span className="text-xl font-serif font-semibold text-gray-900 block">
                Camina Segura
              </span>
              <span className="text-xs text-gray-500">
                Tu seguridad es nuestra prioridad
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Navegación principal">
            {navItems.map(item => (
              <div key={item.id} className="relative">
                <button
                  onClick={() => handleNavClick(item)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    activePage === item.id || (item.submenu && item.submenu.some(sub => sub.id === activePage))
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.submenu && (
                    <span className="text-xs">{openSubmenu === item.id ? '▲' : '▼'}</span>
                  )}
                </button>

                {/* Dropdown submenu */}
                {item.submenu && openSubmenu === item.id && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px] z-50">
                    {item.submenu.map(subItem => (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          setActivePage(subItem.id);
                          setOpenSubmenu(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                          activePage === subItem.id
                            ? 'text-purple-600 bg-purple-50'
                            : 'text-gray-700'
                        }`}
                      >
                        <span>{subItem.icon}</span>
                        <span>{subItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button 
            className="lg:hidden p-2 text-gray-600 hover:text-purple-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            {navItems.map(item => (
              <div key={item.id} className="mb-2">
                <button
                  onClick={() => handleNavClick(item)}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-colors flex items-center justify-between ${
                    activePage === item.id || (item.submenu && item.submenu.some(sub => sub.id === activePage))
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </span>
                  {item.submenu && (
                    <span className="text-xs">{openSubmenu === item.id ? '▲' : '▼'}</span>
                  )}
                </button>

                {/* Mobile submenu */}
                {item.submenu && openSubmenu === item.id && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.submenu.map(subItem => (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          setActivePage(subItem.id);
                          setMobileMenuOpen(false);
                          setOpenSubmenu(null);
                        }}
                        className={`w-full px-4 py-2 rounded-lg text-left transition-colors flex items-center gap-2 ${
                          activePage === subItem.id
                            ? 'text-purple-600 bg-purple-50'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span>{subItem.icon}</span>
                        <span className="text-sm">{subItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Emergency Button in Mobile Menu */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setActivePage('simulador');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all flex items-center justify-center gap-2"
              >
                <span>🚨</span>
                <span>Botón de Pánico</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Quick Access (Desktop) */}
      <div className="hidden lg:block bg-gradient-to-r from-purple-600 to-pink-600 py-2">
        <div className="container flex items-center justify-between text-white text-sm">
          <div className="flex items-center gap-6">
            <span className="font-medium">🛡️ Acceso Rápido:</span>
            <button
              onClick={() => setActivePage('evaluacion')}
              className="hover:bg-white/10 px-3 py-1 rounded transition"
            >
              📊 Evaluar Entorno
            </button>
            <button
              onClick={() => setActivePage('rutas')}
              className="hover:bg-white/10 px-3 py-1 rounded transition"
            >
              🗺️ Rutas
            </button>
            <button
              onClick={() => setActivePage('simulador')}
              className="hover:bg-white/10 px-3 py-1 rounded transition"
            >
              🚨 Emergencia
            </button>
            <button
              onClick={() => setActivePage('comunidad')}
              className="hover:bg-white/10 px-3 py-1 rounded transition"
            >
              🤝 Reportes
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-75">En emergencia real llama al</span>
            <a 
              href="tel:112" 
              className="px-3 py-1 bg-white text-purple-600 rounded font-bold hover:bg-gray-100 transition"
            >
              112
            </a>
            <span className="text-xs opacity-75">o</span>
            <a 
              href="tel:016" 
              className="px-3 py-1 bg-white text-purple-600 rounded font-bold hover:bg-gray-100 transition"
            >
              016
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
