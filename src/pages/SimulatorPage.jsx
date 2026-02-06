import React, { useState, useEffect, useRef } from 'react';

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocalización no soportada');
      setLoading(false);
      return Promise.reject('Geolocalización no soportada');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          };
          setLocation(loc);
          setLoading(false);
          resolve(loc);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const watchLocation = (callback) => {
    if (!navigator.geolocation) return null;

    return navigator.geolocation.watchPosition(
      (position) => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp)
        };
        setLocation(loc);
        callback(loc);
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  };

  return { location, error, loading, getCurrentLocation, watchLocation };
};

// Hook para notificaciones push
const useNotifications = () => {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') {
      console.warn('Notificaciones no soportadas');
      return false;
    }

    if (permission === 'granted') return true;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return false;
    }
  };

  const sendNotification = (title, options = {}) => {
    if (permission !== 'granted') {
      console.warn('Permisos de notificación no concedidos');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '🛡️',
        badge: '🚨',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        ...options
      });

      return notification;
    } catch (error) {
      console.error('Error enviando notificación:', error);
    }
  };

  return { permission, requestPermission, sendNotification };
};

// Hook para compartir contenido
const useShare = () => {
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const shareLocation = async (location, message, contacts) => {
    const googleMapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    const text = `${message}\n\n📍 Mi ubicación: ${googleMapsUrl}\n⏰ ${new Date().toLocaleString('es-ES')}`;

    if (canShare) {
      try {
        await navigator.share({
          title: '🚨 Alerta de Emergencia - Camina Segura',
          text: text
        });
        return { success: true, method: 'native' };
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error compartiendo:', error);
        }
      }
    }

    // Fallback: WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    return { success: true, method: 'whatsapp' };
  };

  const shareSMS = (phone, message) => {
    const smsUrl = `sms:${phone}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  };

  return { canShare, shareLocation, shareSMS };
};

// Hook para detección de movimiento
const useShakeDetection = (onShake, threshold = 25) => {
  const [isListening, setIsListening] = useState(false);
  const lastUpdate = useRef(Date.now());
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (!isListening) return;

    const handleMotion = (event) => {
      const current = Date.now();
      if (current - lastUpdate.current < 100) return;

      const { x, y, z } = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
      const deltaX = Math.abs(x - lastAcceleration.current.x);
      const deltaY = Math.abs(y - lastAcceleration.current.y);
      const deltaZ = Math.abs(z - lastAcceleration.current.z);

      if (deltaX + deltaY + deltaZ > threshold) {
        onShake();
      }

      lastAcceleration.current = { x, y, z };
      lastUpdate.current = current;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isListening, onShake, threshold]);

  return { isListening, setIsListening };
};

// Componente Principal
export default function CaminaSeguraEnhanced() {
  const [activeTab, setActiveTab] = useState('panic');
  const [contacts, setContacts] = useState([]);
  const [panicHistory, setPanicHistory] = useState([]);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [callerName, setCallerName] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [panicStatus, setPanicStatus] = useState({
    type: 'info',
    message: '🛡️ Sistema iniciando...'
  });
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [shakeToActivate, setShakeToActivate] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { location, error: locationError, loading: locationLoading, getCurrentLocation, watchLocation } = useGeolocation();
  const { permission, requestPermission, sendNotification } = useNotifications();
  const { shareLocation, shareSMS } = useShare();
  
  const timerIntervalRef = useRef(null);
  const watchIdRef = useRef(null);
  const sirenAudioRef = useRef(null);

  // Inicialización
  useEffect(() => {
    initializeApp();
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const initializeApp = async () => {
    loadSavedData();
    await requestPermission();
    
    try {
      await getCurrentLocation();
      setPanicStatus({
        type: 'success',
        message: '✅ Sistema activo - Ubicación detectada'
      });
    } catch (err) {
      setPanicStatus({
        type: 'warning',
        message: '⚠️ Sistema activo - Activa la ubicación para mejor protección'
      });
    }
  };

  const loadSavedData = () => {
    try {
      const savedContacts = localStorage.getItem('secureAppContacts');
      const savedHistory = localStorage.getItem('secureAppHistory');
      const savedSettings = localStorage.getItem('secureAppSettings');
      
      if (savedContacts) setContacts(JSON.parse(savedContacts));
      if (savedHistory) setPanicHistory(JSON.parse(savedHistory));
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setShakeToActivate(settings.shakeToActivate || false);
        setSoundEnabled(settings.soundEnabled !== false);
        setCallerName(settings.defaultCaller || 'Mamá');
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  useEffect(() => {
    localStorage.setItem('secureAppContacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('secureAppHistory', JSON.stringify(panicHistory));
  }, [panicHistory]);

  useEffect(() => {
    const settings = { shakeToActivate, soundEnabled, defaultCaller: callerName };
    localStorage.setItem('secureAppSettings', JSON.stringify(settings));
  }, [shakeToActivate, soundEnabled, callerName]);

  useEffect(() => {
    if (timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            handleTimerExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerSeconds > 0]);

  useShakeDetection(() => {
    if (shakeToActivate) {
      activatePanic();
    }
  }, 30);

  const handleTimerExpired = () => {
    sendNotification('⏰ Temporizador expirado', {
      body: 'No has cancelado el temporizador. Activando alerta de emergencia.',
      requireInteraction: true
    });
    
    if (navigator.vibrate) {
      navigator.vibrate([500, 250, 500, 250, 500]);
    }
    
    activatePanic();
  };

  const activatePanic = async () => {
    setPanicStatus({
      type: 'danger',
      message: '🚨 ALERTA ACTIVADA - Obteniendo ubicación...'
    });

    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200, 100, 200]);
    }

    if (soundEnabled) {
      playAlarmSound();
    }

    let currentLocation = location;
    if (!currentLocation) {
      try {
        currentLocation = await getCurrentLocation();
      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
      }
    }

    sendNotification('🚨 ALERTA DE EMERGENCIA ACTIVADA', {
      body: 'Se está compartiendo tu ubicación con tus contactos de emergencia',
      requireInteraction: true
    });

    if (currentLocation && contacts.length > 0) {
      const message = `🚨 EMERGENCIA - ${new Date().toLocaleString('es-ES')}\nNecesito ayuda urgente. Esta es mi ubicación actual.`;
      
      try {
        await shareLocation(currentLocation, message, contacts);
        
        setPanicStatus({
          type: 'success',
          message: `✅ Alerta enviada\n📍 Ubicación compartida\n👥 ${contacts.length} contacto(s)\n⏰ ${new Date().toLocaleTimeString('es-ES')}`
        });
      } catch (error) {
        setPanicStatus({
          type: 'warning',
          message: '⚠️ Alerta activada - Comparte manualmente tu ubicación con tus contactos'
        });
      }

      const newHistoryItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action: 'Botón de pánico activado',
        location: currentLocation,
        contacts: contacts.length
      };

      setPanicHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]);

      setTimeout(() => {
        setPanicStatus({
          type: 'success',
          message: '✅ Sistema activo - Listo para usar'
        });
        stopAlarmSound();
      }, 10000);
    } else {
      setPanicStatus({
        type: 'error',
        message: contacts.length === 0 
          ? '❌ Añade contactos de emergencia primero'
          : '❌ No se pudo obtener tu ubicación'
      });
      
      setTimeout(() => {
        setPanicStatus({
          type: 'success',
          message: '✅ Sistema activo - Listo para usar'
        });
        stopAlarmSound();
      }, 5000);
    }
  };

  const playAlarmSound = () => {
    if (!sirenAudioRef.current) {
      sirenAudioRef.current = new Audio();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      
      sirenAudioRef.current.oscillator = oscillator;
      sirenAudioRef.current.audioContext = audioContext;
      sirenAudioRef.current.gainNode = gainNode;
    }
  };

  const stopAlarmSound = () => {
    if (sirenAudioRef.current?.oscillator) {
      sirenAudioRef.current.oscillator.stop();
      sirenAudioRef.current.audioContext.close();
      sirenAudioRef.current = null;
    }
  };

  const triggerFakeCall = (seconds) => {
    if (!callerName.trim()) {
      alert('⚠️ Configura el nombre del contacto primero');
      return;
    }

    if (seconds > 0) {
      sendNotification(`📞 Llamada programada`, {
        body: `Recibirás una llamada de "${callerName}" en ${seconds} segundos`
      });
    }

    setTimeout(() => {
      setShowIncomingCall(true);
      if (navigator.vibrate) {
        const pattern = [];
        for (let i = 0; i < 10; i++) {
          pattern.push(500, 200);
        }
        navigator.vibrate(pattern);
      }
      
      sendNotification(`📞 Llamada entrante`, {
        body: `${callerName} te está llamando`,
        requireInteraction: true
      });
    }, seconds * 1000);
  };

  const addContact = (name, phone) => {
    if (!name?.trim() || !phone?.trim()) {
      alert('⚠️ Por favor completa todos los campos');
      return;
    }
    
    setContacts(prev => [...prev, { 
      id: Date.now(), 
      name: name.trim(), 
      phone: phone.trim() 
    }]);
    
    sendNotification('✅ Contacto añadido', {
      body: `${name} ha sido añadido a tus contactos de emergencia`
    });
  };

  const removeContact = (id) => {
    if (window.confirm('¿Eliminar este contacto de emergencia?')) {
      setContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  const startLocationSharing = async () => {
    if (contacts.length === 0) {
      alert('⚠️ Primero añade contactos de emergencia en la pestaña "Contactos"');
      return;
    }

    setIsLocationSharing(true);
    
    try {
      const currentLocation = await getCurrentLocation();
      
      watchIdRef.current = watchLocation((loc) => {
        console.log('Ubicación actualizada:', loc);
      });

      const googleMapsUrl = `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`;
      const message = `📍 Estoy compartiendo mi ubicación en tiempo real\n${googleMapsUrl}\n⏰ ${new Date().toLocaleString('es-ES')}`;

      await shareLocation(currentLocation, message, contacts);
      
      sendNotification('📍 Ubicación compartida', {
        body: `Compartiendo ubicación con ${contacts.length} contacto(s)`
      });

    } catch (error) {
      console.error('Error compartiendo ubicación:', error);
      alert('⚠️ Error al obtener ubicación. Verifica los permisos.');
      setIsLocationSharing(false);
    }
  };

  const stopLocationSharing = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLocationSharing(false);
    sendNotification('📍 Compartir ubicación detenido', {
      body: 'Has dejado de compartir tu ubicación'
    });
  };

  const setTimer = (minutes) => {
    if (contacts.length === 0) {
      alert('⚠️ Primero añade contactos de emergencia en la pestaña "Contactos"');
      return;
    }

    setTimerSeconds(minutes * 60);
    sendNotification(`⏱️ Temporizador activado`, {
      body: `${minutes} minutos - Recuerda cancelarlo al llegar`,
      requireInteraction: false
    });
  };

  const stopTimer = () => {
    if (timerSeconds > 0) {
      setTimerSeconds(0);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      sendNotification('⏹️ Temporizador cancelado', {
        body: 'Has llegado a salvo'
      });
    }
  };

  const tabs = [
    { id: 'panic', label: '🚨 SOS' },
    { id: 'fake-call', label: '📞 Llamada' },
    { id: 'contacts', label: '👥 Contactos' },
    { id: 'route', label: '🗺️ Ruta' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">🛡️ Camina Segura</h1>
        <p className="text-purple-200 text-sm">Tu seguridad es nuestra prioridad - Catalunya</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex space-x-1 border-b overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600'
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
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'panic' && (
            <PanicTab
              panicStatus={panicStatus}
              activatePanic={activatePanic}
              panicHistory={panicHistory}
              location={location}
              locationLoading={locationLoading}
              locationError={locationError}
              shakeToActivate={shakeToActivate}
              setShakeToActivate={setShakeToActivate}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
            />
          )}
          
          {activeTab === 'fake-call' && (
            <FakeCallTab
              callerName={callerName}
              setCallerName={setCallerName}
              triggerFakeCall={triggerFakeCall}
            />
          )}
          
          {activeTab === 'contacts' && (
            <ContactsTab
              contacts={contacts}
              addContact={addContact}
              removeContact={removeContact}
              permission={permission}
              requestPermission={requestPermission}
            />
          )}
          
          {activeTab === 'route' && (
            <RouteTab
              startLocationSharing={startLocationSharing}
              stopLocationSharing={stopLocationSharing}
              isLocationSharing={isLocationSharing}
              timerSeconds={timerSeconds}
              setTimer={setTimer}
              stopTimer={stopTimer}
              location={location}
              getCurrentLocation={getCurrentLocation}
            />
          )}
        </div>
      </div>

      {/* Incoming Call Modal */}
      {showIncomingCall && (
        <IncomingCall
          callerName={callerName}
          onAnswer={() => {
            sendNotification('📞 Llamada "respondida"', {
              body: 'Actúa de forma natural y aléjate de la situación'
            });
            setShowIncomingCall(false);
          }}
          onDecline={() => setShowIncomingCall(false)}
        />
      )}
    </div>
  );
}

// Tab de Pánico
function PanicTab({ 
  panicStatus, 
  activatePanic, 
  panicHistory, 
  location, 
  locationLoading,
  locationError,
  shakeToActivate,
  setShakeToActivate,
  soundEnabled,
  setSoundEnabled
}) {
  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-blue-900">
          ⚠️ Presiona el botón en caso de emergencia. Se compartirá tu ubicación GPS real con tus contactos.
        </p>
      </div>

      {/* Quick Settings */}
      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={shakeToActivate}
            onChange={(e) => setShakeToActivate(e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <span className="text-gray-700">Activar agitando el teléfono</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <span className="text-gray-700">Sonido de alarma</span>
        </label>
      </div>

      {/* Location Status */}
      {location && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded flex gap-4">
          <div className="text-2xl">📍</div>
          <div className="flex-1">
            <div className="font-semibold text-green-900">Ubicación detectada</div>
            <div className="text-sm text-green-700 font-mono mt-1">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              Precisión: {Math.round(location.accuracy)}m
            </div>
          </div>
        </div>
      )}

      {locationError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-sm text-yellow-900">
            ⚠️ Error de ubicación: {locationError}
            <br />
            <small>Activa el GPS en la configuración de tu dispositivo</small>
          </p>
        </div>
      )}

      {/* Panic Button */}
      <div className="flex justify-center py-8">
        <button 
          onClick={activatePanic}
          disabled={locationLoading}
          className="w-48 h-48 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-3 border-8 border-white"
        >
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
         <span className="text-xl md:text-2xl font-bold text-center leading-tight">
            {locationLoading ? 'OBTENIENDO\nUBICACIÓN...' : 'BOTÓN DE\nPÁNICO'}
          </span>
        </button>
      </div>

      {/* Status Alert */}
      <div className={`border-l-4 p-4 rounded ${
        panicStatus.type === 'danger' ? 'bg-red-50 border-red-500' :
        panicStatus.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
        panicStatus.type === 'error' ? 'bg-red-50 border-red-500' :
        panicStatus.type === 'info' ? 'bg-blue-50 border-blue-500' :
        'bg-green-50 border-green-500'
      }`}>
        <p className={`text-sm whitespace-pre-line ${
          panicStatus.type === 'danger' || panicStatus.type === 'error' ? 'text-red-900' :
          panicStatus.type === 'warning' ? 'text-yellow-900' :
          panicStatus.type === 'info' ? 'text-blue-900' :
          'text-green-900'
        }`}>
          {panicStatus.message}
        </p>
      </div>

      {/* History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Historial de Activaciones</h3>
        {panicHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay activaciones registradas</p>
        ) : (
          <div className="space-y-3">
            {panicHistory.slice(0, 10).map((item) => {
              const date = new Date(item.timestamp);
              return (
                <div key={item.id} className="bg-gray-50 border-l-4 border-purple-500 p-4 rounded">
                  <div className="text-xs text-gray-600 mb-2">
                    📅 {date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} - 
                    ⏰ {date.toLocaleTimeString('es-ES')}
                  </div>
                  <div className="font-semibold text-gray-800">🚨 {item.action}</div>
                  {item.location && (
                    <div className="text-xs text-gray-600 font-mono mt-1">
                      📍 {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    👥 Enviado a {item.contacts} contacto(s)
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Tab de Llamada Falsa
function FakeCallTab({ callerName, setCallerName, triggerFakeCall }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-blue-900">
          📞 Simula recibir una llamada para salir de situaciones incómodas discretamente.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">⚙️ Configurar Llamada Falsa</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del contacto que llama
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Ej: Mamá, Papá, María..."
            value={callerName}
            onChange={(e) => setCallerName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => triggerFakeCall(5)}
            disabled={!callerName.trim()}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            📞 En 5 seg
          </button>
          <button 
            onClick={() => triggerFakeCall(30)}
            disabled={!callerName.trim()}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            📞 En 30 seg
          </button>
          <button 
            onClick={() => triggerFakeCall(60)}
            disabled={!callerName.trim()}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            📞 En 1 min
          </button>
          <button 
            onClick={() => triggerFakeCall(0)}
            disabled={!callerName.trim()}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            📞 Ahora
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold text-gray-800 mb-3">💡 Consejos de uso</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Configura el nombre antes de salir de casa</li>
          <li>• Usa un nombre de alguien creíble que te llamaría</li>
          <li>• Al recibir la llamada, actúa de forma natural</li>
          <li>• Aprovecha la "conversación" para alejarte</li>
          <li>• Puedes fingir una urgencia familiar</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <p className="text-sm text-yellow-900">
          <strong>⚠️ Recuerda:</strong> Esta es una herramienta de seguridad. Úsala cuando te sientas incómoda o en peligro.
        </p>
      </div>
    </div>
  );
}

// Tab de Contactos
function ContactsTab({ contacts, addContact, removeContact, permission, requestPermission }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      addContact(name, phone);
      setName('');
      setPhone('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-blue-900">
          👥 Añade contactos de confianza que recibirán tu ubicación en emergencias.
        </p>
      </div>

      {permission !== 'granted' && (
        <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4 rounded">
          <p className="text-sm text-cyan-900 mb-3">
            🔔 Activa las notificaciones para recibir alertas importantes
          </p>
          <button 
            onClick={requestPermission}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors"
          >
            Activar Notificaciones
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">➕ Añadir Contacto de Emergencia</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Ej: María García"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono (con prefijo)</label>
          <input
            type="tel"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="+34 612 345 678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all"
        >
          ➕ Añadir Contacto
        </button>
      </form>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          👥 Mis Contactos de Emergencia
          {contacts.length > 0 && (
            <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
              {contacts.length}
            </span>
          )}
        </h3>
        
        {contacts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-gray-500 font-medium mb-2">No hay contactos añadidos</p>
            <p className="text-sm text-gray-400">
              Añade al menos 2 contactos de confianza para usar todas las funciones
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate">{contact.name}</h4>
                    <p className="text-sm text-gray-600">📱 {contact.phone}</p>
                  </div>
                  <button
                    onClick={() => removeContact(contact.id)}
                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar contacto"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            
            {contacts.length < 2 && (
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                <p className="text-sm text-yellow-900">
                  💡 Te recomendamos añadir al menos 2 contactos para mayor seguridad
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function RouteTab({ 
  startLocationSharing, 
  stopLocationSharing,
  isLocationSharing, 
  timerSeconds, 
  setTimer, 
  stopTimer,
  location,
  getCurrentLocation 
}) {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const [refreshingLocation, setRefreshingLocation] = useState(false);

  const handleRefreshLocation = async () => {
    setRefreshingLocation(true);
    try {
      await getCurrentLocation();
    } finally {
      setRefreshingLocation(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-xl text-blue-900">
          🗺️ Comparte tu ubicación GPS en tiempo real y configura temporizadores de seguridad.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">📍 Compartir Ubicación en Tiempo Real</h3>
        
        {location && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">📍 Ubicación actual</span>
              <button 
                onClick={handleRefreshLocation}
                disabled={refreshingLocation}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {refreshingLocation ? '🔄' : '↻'}
              </button>
            </div>
            <div className="font-mono text-sm text-gray-700 space-y-1">
              <div>Lat: {location.latitude.toFixed(6)}</div>
              <div>Lng: {location.longitude.toFixed(6)}</div>
            </div>
            <div className="text-xs text-gray-600">
              Precisión: ±{Math.round(location.accuracy)} metros
            </div>
            <a 
              href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              🗺️ Ver en Google Maps
            </a>
          </div>
        )}

        {isLocationSharing ? (
          <button 
            onClick={stopLocationSharing}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            ⏹️ Dejar de Compartir Ubicación
          </button>
        ) : (
          <button 
            onClick={startLocationSharing}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all"
          >
            📡 Compartir mi Ubicación Ahora
          </button>
        )}

        {isLocationSharing && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded flex gap-3 items-start">
            <div className="text-2xl animate-pulse">📍</div>
            <div>
              <strong className="text-green-900">Compartiendo ubicación en vivo</strong>
              <p className="text-sm text-green-700 mt-1">
                Tus contactos pueden ver tu ubicación en tiempo real
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">⏱️ Temporizador de Seguridad</h3>
        <p className="text-sm text-gray-600">
          Establece cuánto durará tu trayecto. Se enviará una alerta automática si no lo cancelas a tiempo.
        </p>
        
        <div className={`text-6xl font-bold font-mono text-center py-6 ${
          timerSeconds > 0 ? (timerSeconds < 300 ? 'text-red-600' : 'text-orange-600') : 'text-purple-600'
        }`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        
        {timerSeconds > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
            <p className="text-sm text-yellow-900">
              ⚠️ Temporizador activo - Recuerda cancelarlo al llegar
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setTimer(15)}
            disabled={timerSeconds > 0}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ⏱️ 15 min
          </button>
          <button 
            onClick={() => setTimer(30)}
            disabled={timerSeconds > 0}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ⏱️ 30 min
          </button>
          <button 
            onClick={() => setTimer(45)}
            disabled={timerSeconds > 0}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ⏱️ 45 min
          </button>
          <button 
            onClick={() => setTimer(60)}
            disabled={timerSeconds > 0}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ⏱️ 1 hora
          </button>
        </div>
        
        {timerSeconds > 0 && (
          <button 
            onClick={stopTimer}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            ✅ He Llegado - Cancelar Temporizador
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🛡️ Consejos de Seguridad</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>🌙 Evita caminar sola por zonas poco iluminadas de noche</li>
          <li>📱 Mantén tu teléfono cargado y accesible</li>
          <li>👀 Estate atenta a tu entorno y confía en tu instinto</li>
          <li>🎧 No uses auriculares que bloqueen el sonido ambiente</li>
          <li>🚶‍♀️ Camina con confianza y propósito</li>
          <li>💼 Ten las llaves preparadas antes de llegar</li>
        </ul>
      </div>
    </div>
  );
}

// Componente de Llamada Entrante
function IncomingCall({ callerName, onAnswer, onDecline }) {
  const [ringing, setRinging] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setRinging(r => !r);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white">
      <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-5xl mb-8 transition-transform ${
        ringing ? 'scale-110' : 'scale-100'
      }`}>
        👤
      </div>
      <div className="text-4xl font-semibold mb-2">{callerName || 'Desconocido'}</div>
      <div className={`text-lg mb-16 transition-opacity ${ringing ? 'opacity-100' : 'opacity-60'}`}>
        Llamada entrante...
      </div>
      <div className="flex gap-10 mb-8">
        <button 
          onClick={onDecline}
          className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
          title="Rechazar llamada"
        >
          <svg className="w-10 h-10" fill="white" viewBox="0 0 24 24">
            <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
          </svg>
        </button>
        <button 
          onClick={onAnswer}
          className="w-20 h-20 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-colors"
          title="Responder llamada"
        >
          <svg className="w-10 h-10" fill="white" viewBox="0 0 24 24">
            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
          </svg>
        </button>
      </div>
      <p className="text-gray-400 text-sm max-w-xs text-center leading-relaxed">
        💡 Responde y finge una conversación urgente para alejarte de la situación
      </p>
    </div>
  );
}