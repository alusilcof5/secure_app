import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MapaPage from './pages/MapaPage';
import { DatosPage } from './pages/OtherPages';
import TransportePage from './pages/TransportePage';
import SimulatorPage from './pages/SimulatorPage';

function App() {
  const [activePage, setActivePage] = useState('inicio');

  const renderPage = () => {
    switch (activePage) {
      case 'inicio':
        return <HomePage setActivePage={setActivePage} />;
      case 'mapa':
        return <MapaPage />;
      case 'analisis':
        return <TransportePage />;
      case 'simulador':
        return <SimulatorPage />;
      case 'datos':
        return <DatosPage />;
      case 'seguridad':
        return <SeguridadPage />;
      default:
        return <HomePage setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

export default App;