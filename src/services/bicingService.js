const BICING_CONFIG = {
  API_URL: 'https://www.bicing.barcelona/availability_map/getJsonObject',
  CACHE_DURATION: 60000, 
};

let cache = {
  data: null,
  timestamp: null
};

export const getAllBicingStations = async () => {
  
  const now = Date.now();
  if (cache.data && cache.timestamp && (now - cache.timestamp < BICING_CONFIG.CACHE_DURATION)) {
    console.log('📦 Usando caché de Bicing');
    return cache.data;
  }

  console.log('🌐 Consultando API de Bicing...');

  try {
    const response = await fetch(BICING_CONFIG.API_URL);
    
    if (!response.ok) {
      throw new Error(`Bicing API Error: ${response.status}`);
    }

    const data = await response.json();

   
    const stations = data.features.map(feature => ({
      id: feature.properties.id,
      name: feature.properties.name,
      street: feature.properties.streetName,
      streetNumber: feature.properties.streetNumber,
      altitude: feature.properties.altitude,
      capacity: feature.properties.capacity,
      bikes: {
        mechanical: feature.properties.bikes,
        electrical: feature.properties.electrical_bikes || 0,
        total: feature.properties.bikes
      },
      slots: feature.properties.slots,
      status: feature.properties.status, 
      isOpen: feature.properties.status === 'OPN',
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
      lastUpdate: new Date()
    }));

    
    cache = {
      data: stations,
      timestamp: now
    };

    console.log(`✅ ${stations.length} estaciones de Bicing cargadas`);
    return stations;

  } catch (error) {
    console.error('❌ Error fetching Bicing data:', error);
    
    if (cache.data) {
      console.warn('⚠️ Usando caché antiguo de Bicing');
      return cache.data;
    }
    throw error;
  }
};

export const getNearbyBicingStations = async (lat, lng, radiusMeters = 500) => {
  const allStations = await getAllBicingStations();
  
  return allStations
    .map(station => ({
      ...station,
      distance: calculateDistance(lat, lng, station.lat, station.lng)
    }))
    .filter(station => station.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance);
};

export const getBicingStationsWithBikes = async (lat, lng, radiusMeters = 1000, minBikes = 1) => {
  const nearbyStations = await getNearbyBicingStations(lat, lng, radiusMeters);
  
  return nearbyStations
    .filter(station => station.isOpen && station.bikes.total >= minBikes)
    .slice(0, 10); 
};

export const getBicingStationsWithSlots = async (lat, lng, radiusMeters = 1000, minSlots = 1) => {
  const nearbyStations = await getNearbyBicingStations(lat, lng, radiusMeters);
  
  return nearbyStations
    .filter(station => station.isOpen && station.slots >= minSlots)
    .slice(0, 10);
};

export const getBicingStats = async () => {
  const stations = await getAllBicingStations();
  
  const stats = {
    total: stations.length,
    open: stations.filter(s => s.isOpen).length,
    closed: stations.filter(s => !s.isOpen).length,
    bikes: {
      total: stations.reduce((sum, s) => sum + s.bikes.total, 0),
      mechanical: stations.reduce((sum, s) => sum + s.bikes.mechanical, 0),
      electrical: stations.reduce((sum, s) => sum + s.bikes.electrical, 0)
    },
    slots: {
      total: stations.reduce((sum, s) => sum + s.slots, 0),
      available: stations.filter(s => s.isOpen).reduce((sum, s) => sum + s.slots, 0)
    },
    capacity: stations.reduce((sum, s) => sum + s.capacity, 0)
  };

  return stats;
};


export const clearBicingCache = () => {
  cache = { data: null, timestamp: null };
  console.log('🧹 Caché de Bicing limpiado');
};


const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; 
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

export default {
  getAllBicingStations,
  getNearbyBicingStations,
  getBicingStationsWithBikes,
  getBicingStationsWithSlots,
  getBicingStats,
  clearBicingCache
};
