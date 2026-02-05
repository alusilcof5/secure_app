import React, { useState } from 'react';
import BusTransportPage from './BusTransportPage';
import MetroTransportPage from './MetroTransportPage';
import BicingTransportPage from './BicingTransportPage';
import StopsStationsPage from './StopsStationsPage';

export default function TransportePage() {
  const [activeTab, setActiveTab] = useState('bus');

  const tabs = [
    { id: 'bus', label: '🚌 Bus', component: BusTransportPage },
    { id: 'metro', label: '🚇 Metro', component: MetroTransportPage },
    { id: 'bicing', label: '🚲 Bicing', component: BicingTransportPage },
    { id: 'stops', label: '📍 Paradas y Estaciones', component: StopsStationsPage },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 border-b">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-0">
        {ActiveComponent && <ActiveComponent />}
      </div>

      {/* Footer info */}
      <div className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🚌 API TMB Bus</h4>
              <p className="text-gray-400">
                Datos oficiales de paradas, líneas y horarios de autobús
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🚇 API TMB Metro</h4>
              <p className="text-gray-400">
                Red completa de Metro con estaciones y correspondencias
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🚲 API Bicing</h4>
              <p className="text-gray-400">
                Disponibilidad en tiempo real de bicicletas públicas
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-700 text-center text-gray-400">
            <p>
              <strong>Camina Segura · Catalunya</strong> | 
              Datos: TMB Barcelona & Bicing | 
              APIs Oficiales (NO MOCK)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
