import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MapaPage from './pages/MapaPage';
import { DatosPage } from './pages/OtherPages';
import TransportePage from './pages/TransportePage';
import SimulatorPage from './pages/SimulatorPage';
import SafetyEvaluationPage from './pages/SafetyEvaluationPage';
import CommunityNetworkPage from './pages/CommunityNetworkPage';
import PersonalAnalysisPage from './pages/PersonalAnalysisPage';
import SafeRoutesPage from './pages/SafeRoutesPage';

function App() {
  const [activePage, setActivePage] = useState('inicio');

  const renderPage = () => {
    switch (activePage) {
      case 'inicio':
        return <HomePage setActivePage={setActivePage} />;
      case 'mapa':
        return <MapaPage />;
      case 'transporte':
        return <TransportePage />;
      case 'evaluacion':
        return <SafetyEvaluationPage />;
      case 'simulador':
        return <SimulatorPage />;
      case 'comunidad':
        return <CommunityNetworkPage />;
      case 'rutas':
        return <SafeRoutesPage />;
      case 'analisis':
        return <PersonalAnalysisPage />;
      case 'datos':
        return <DatosPage />;
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