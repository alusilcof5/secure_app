const CACHE_NAME = 'camina-segura-v2.0.0';
const RUNTIME_CACHE = 'camina-segura-runtime';

// Archivos críticos para cachear
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/SimulatorPage.jsx',
  '/manifest.json',
  '/offline.html'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando archivos críticos');
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de caché: Network First con Cache Fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Ignorar peticiones no-GET
  if (request.method !== 'GET') return;
  
  // Ignorar peticiones a APIs externas (excepto Google Maps)
  const url = new URL(request.url);
  if (url.origin !== location.origin && !url.hostname.includes('google')) {
    return;
  }

  event.respondWith(
    // Intentar red primero
    fetch(request)
      .then((response) => {
        // Solo cachear respuestas válidas
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clonar respuesta para caché
        const responseToCache = response.clone();
        
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Si falla la red, intentar caché
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Si es navegación y no hay caché, mostrar página offline
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          
          // Para otros recursos, retornar error
          return new Response('Offline - Recurso no disponible', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Escuchar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});

// Manejo de notificaciones push (para futuras implementaciones)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nueva alerta de seguridad',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'camina-segura-alert',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver',
        icon: '/icon-view.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icon-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('🛡️ Camina Segura', options)
  );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sincronización en segundo plano (para envío de alertas offline)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-emergency-alert') {
    event.waitUntil(syncEmergencyAlert());
  }
});

async function syncEmergencyAlert() {
  try {
    // Recuperar alertas pendientes del IndexedDB
    const alerts = await getPendingAlerts();
    
    for (const alert of alerts) {
      // Intentar enviar cada alerta
      await sendAlert(alert);
      
      // Si se envió correctamente, marcar como completada
      await markAlertAsSent(alert.id);
    }
    
    console.log('[SW] Alertas sincronizadas correctamente');
  } catch (error) {
    console.error('[SW] Error sincronizando alertas:', error);
    throw error; // Re-throw para que se reintente
  }
}

// Funciones auxiliares para IndexedDB (simplificadas)
async function getPendingAlerts() {
  // Implementar acceso a IndexedDB
  return [];
}

async function sendAlert(alert) {
  // Implementar envío de alerta
  console.log('[SW] Enviando alerta:', alert);
}

async function markAlertAsSent(alertId) {
  // Implementar marcado como enviada
  console.log('[SW] Alerta enviada:', alertId);
}

console.log('[SW] Service Worker cargado correctamente');
