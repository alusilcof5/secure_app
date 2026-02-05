import React from 'react';

export default function Header({ activePage, setActivePage }) {
  const navItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'mapa', label: 'Equipamientos' },
    { id: 'analisis', label: 'Transporte' },
    { id: 'simulador', label: 'Simulador' },
    { id: 'datos', label: 'Datos Abiertos' }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActivePage('inicio')}>
            <span className="text-3xl">🌸</span>
            <span className="text-xl font-serif font-semibold text-gray-900">Camina Segura</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Navegación principal">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePage === item.id
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-gray-600 hover:text-primary-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
