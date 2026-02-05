import React from 'react';
import TransportePage from './TransportePage';
import './index.css'; // Asegúrate de que apunte a tu Tailwind CSS

export default function TestTransportePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Simple header para testing */}
      <header className="bg-primary-600 text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">🧪 TEST - Página de Transporte</h1>
          <p className="text-sm text-primary-100">Testing standalone component</p>
        </div>
      </header>

      {/* Render del componente */}
      <TransportePage />

      {/* Simple footer para testing */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">Testing environment - No backend required</p>
        </div>
      </footer>
    </div>
  );
}

// =================
// CÓMO USAR ESTE TEST
// =================

/*

1. CREAR UN PUNTO DE ENTRADA DE TEST
   Crea test-index.jsx:

   ```jsx
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import TestTransportePage from './TEST_TransportePage';
   import './index.css';

   const root = ReactDOM.createRoot(document.getElementById('root'));
   root.render(
     <React.StrictMode>
       <TestTransportePage />
     </React.StrictMode>
   );
   ```

2. CONFIGURAR PACKAGE.JSON (opcional)
   Añade script de test:

   ```json
   {
     "scripts": {
       "test:transport": "vite --open test-index.html"
     }
   }
   ```

3. EJECUTAR
   ```bash
   npm start
   # o
   npm run dev
   ```

4. CHECKLIST DE PRUEBAS
   ✓ Verifica que el mapa se carga
   ✓ Comprueba que la geolocalización funciona
   ✓ Prueba los filtros (bus/metro/bicing)
   ✓ Cambia el radio de distancia
   ✓ Introduce una dirección y simula ruta
   ✓ Verifica que aparecen opciones de transporte
   ✓ Inspecciona la consola (no debe haber errores críticos)

5. DEBUGGING COMÚN
   
   Problema: Mapa no se ve
   → Verifica que leaflet.css se carga
   → Inspecciona elemento y busca .leaflet-container
   → Altura del contenedor debe ser > 0

   Problema: Marcadores sin icono
   → Ya está solucionado en el código con configuración manual

   Problema: No pide ubicación
   → Debe ser HTTPS o localhost
   → Verificar permisos del navegador

   Problema: API Bicing falla
   → Verificar CORS (debería funcionar)
   → Inspeccionar Network tab
   → Verifica que hay fallback a mock data

*/

// =================
// TEST CASES MANUAL
// =================

/*

TEST 1: Carga inicial
- [ ] Página carga sin errores
- [ ] Mapa se renderiza
- [ ] Solicita geolocalización (popup del navegador)
- [ ] Muestra ubicación en el mapa
- [ ] Círculo de radio visible

TEST 2: Filtros
- [ ] Toggle bus on/off → marcadores desaparecen/aparecen
- [ ] Toggle metro on/off → marcadores desaparecen/aparecen
- [ ] Toggle bicing on/off → marcadores desaparecen/aparecen
- [ ] Slider de distancia → actualiza círculo y filtra marcadores

TEST 3: Datos de transporte
- [ ] Marcadores de bus tienen popup con info
- [ ] Marcadores de metro tienen popup con info
- [ ] Marcadores de bicing tienen popup con info
- [ ] Números de disponibilidad son realistas

TEST 4: Simulador
- [ ] Input de dirección acepta texto
- [ ] Botón deshabilitado si no hay dirección
- [ ] Al calcular ruta, hace geocoding
- [ ] Aparece marcador de "casa" en destino
- [ ] Muestra al menos 1 opción de ruta
- [ ] Opciones tienen tiempo estimado
- [ ] Opciones tienen badge de seguridad

TEST 5: Responsive
- [ ] Funciona en desktop (> 1024px)
- [ ] Funciona en tablet (768px - 1024px)
- [ ] Funciona en mobile (< 768px)
- [ ] Sidebar colapsa correctamente en mobile

TEST 6: Performance
- [ ] No hay lag al mover el mapa
- [ ] Actualización cada 30s no causa flicker
- [ ] Filtros responden instantáneamente
- [ ] < 15 marcadores por tipo (limitado correctamente)

*/

// =================
// MOCK DATA TESTING
// =================

// Si quieres testear con datos controlados, puedes:

export function TestTransportePageWithMockData() {
  // Override de fetch para Bicing
  const originalFetch = window.fetch;
  
  React.useEffect(() => {
    window.fetch = function (url, ...args) {
      if (url.includes('bicing.barcelona')) {
        // Retornar mock data controlado
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              features: [
                {
                  properties: {
                    id: 'mock-1',
                    name: 'Test Station 1',
                    bikes: 10,
                    slots: 5,
                  },
                  geometry: {
                    coordinates: [2.1734, 41.3851],
                  },
                },
                // ... más estaciones de test
              ],
            }),
        });
      }
      // Otras URLs usan fetch original
      return originalFetch(url, ...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <TransportePage />;
}

// =================
// TESTS AUTOMATIZADOS (opcional)
// =================

// Si usas Jest + React Testing Library:

/*
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransportePage from './TransportePage';

describe('TransportePage', () => {
  test('renders without crashing', () => {
    render(<TransportePage />);
    expect(screen.getByText(/Transporte en Tiempo Real/i)).toBeInTheDocument();
  });

  test('shows filters', () => {
    render(<TransportePage />);
    expect(screen.getByText(/Bus/i)).toBeInTheDocument();
    expect(screen.getByText(/Metro/i)).toBeInTheDocument();
    expect(screen.getByText(/Bicing/i)).toBeInTheDocument();
  });

  test('calculates route when address is entered', async () => {
    render(<TransportePage />);
    
    const input = screen.getByPlaceholderText(/Carrer de Provença/i);
    const button = screen.getByText(/Calcular rutas/i);

    await userEvent.type(input, 'Carrer de Provença, 250');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Opciones disponibles/i)).toBeInTheDocument();
    });
  });
});
*/
