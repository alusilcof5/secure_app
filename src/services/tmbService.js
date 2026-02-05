const TMB_CONFIG = {
  BASE_URL: 'https://api.tmb.cat/v1/transit',
  APP_ID: import.meta.env.VITE_TMB_APP_ID || 'YOUR_APP_ID',
  APP_KEY: import.meta.env.VITE_TMB_APP_KEY || 'YOUR_APP_KEY',
};

const fetchTMB = async (endpoint, params = {}) => {
  const url = new URL(`${TMB_CONFIG.BASE_URL}${endpoint}`);
  
  url.searchParams.append('app_id', TMB_CONFIG.APP_ID);
  url.searchParams.append('app_key', TMB_CONFIG.APP_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  console.log('🌐 TMB API Request:', url.toString());

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TMB API Error ${response.status}: ${error}`);
    }
    
    const data = await response.json();
    console.log('✅ TMB API Response:', data);
    return data;
  } catch (error) {
    console.error('❌ TMB API Error:', error);
    throw error;
  }
};

export const getAllBusStops = async (filters = {}) => {
  const data = await fetchTMB('/parades', filters);
  
  return data.features.map(feature => ({
    id: feature.properties.ID_PARADA,
    code: feature.properties.CODI_PARADA,
    name: feature.properties.NOM_PARADA,
    description: feature.properties.DESC_PARADA,
    address: feature.properties.ADRECA,
    municipality: feature.properties.NOM_POBLACIO,
    district: feature.properties.NOM_DISTRICTE,
    type: feature.properties.NOM_TIPUS_SIMPLE_PARADA,
    lat: feature.geometry.coordinates[1],
    lng: feature.geometry.coordinates[0],
    raw: feature.properties
  }));
};

export const getBusLineStops = async (lineCode) => {
  const data = await fetchTMB(`/linies/bus/${lineCode}/parades`);
  
  return data.features.map(feature => ({
    id: feature.properties.ID_PARADA,
    code: feature.properties.CODI_PARADA,
    name: feature.properties.NOM_PARADA,
    lineCode: lineCode,
    lat: feature.geometry.coordinates[1],
    lng: feature.geometry.coordinates[0],
    raw: feature.properties
  }));
};


export const getAllBusLines = async () => {
  const data = await fetchTMB('/linies/bus');
  
  return data.features.map(feature => ({
    id: feature.properties.CODI_LINIA,
    code: feature.properties.CODI_LINIA,
    name: feature.properties.NOM_LINIA,
    description: feature.properties.DESC_LINIA,
    color: feature.properties.COLOR_LINIA,
    type: feature.properties.TIPUS_LINIA,
    raw: feature.properties
  }));
};


export const getAllMetroStations = async () => {
  const data = await fetchTMB('/estacions');
  
  return data.features.map(feature => ({
    id: feature.properties.ID_ESTACIO,
    groupCode: feature.properties.CODI_GRUP_ESTACIO,
    name: feature.properties.NOM_ESTACIO,
    lines: feature.properties.PICTO ? feature.properties.PICTO.split(',') : [],
    lat: feature.geometry.coordinates[1],
    lng: feature.geometry.coordinates[0],
    raw: feature.properties
  }));
};


export const getMetroLineStations = async (lineCode) => {
  const data = await fetchTMB(`/linies/metro/${lineCode}/estacions`);
  
  return data.features.map(feature => ({
    id: feature.properties.ID_ESTACIO,
    code: feature.properties.CODI_ESTACIO,
    name: feature.properties.NOM_ESTACIO,
    lineCode: lineCode,
    lat: feature.geometry.coordinates[1],
    lng: feature.geometry.coordinates[0],
    raw: feature.properties
  }));
};

export const getAllMetroLines = async () => {
  const data = await fetchTMB('/linies/metro');
  
  return data.features.map(feature => ({
    id: feature.properties.CODI_LINIA,
    code: feature.properties.CODI_LINIA,
    name: feature.properties.NOM_LINIA,
    color: feature.properties.COLOR_LINIA,
    raw: feature.properties
  }));
};

export const getBusLineSchedules = async (lineCode) => {
  const data = await fetchTMB(`/linies/bus/${lineCode}/horaris`);
  return data.features;
};

export const getBusStopSchedule = async (lineCode, stopCode) => {
  const data = await fetchTMB(`/linies/bus/${lineCode}/parades/${stopCode}/horaris`);
  return data.features;
};

export const getBusStopPassingTimes = async (lineCode, stopCode) => {
  const data = await fetchTMB(`/linies/bus/${lineCode}/parades/${stopCode}/horespas`);
  return data.features;
};

export const getBusStopCorrespondences = async (stopCode) => {
  const data = await fetchTMB(`/parades/${stopCode}/corresp`);

  return data.features.map(feature => ({
    line: feature.properties.LINIA_CORRESPONDENCIA,
    type: feature.properties.TIPUS_CORRESPONDENCIA,
    name: feature.properties.NOM_CORRESPONDENCIA,
    raw: feature.properties
  }));
};

export const getMetroStationAccesses = async (groupCode) => {
  const data = await fetchTMB(`/estacions/${groupCode}/accessos`);
  
  return data.features.map(feature => ({
    code: feature.properties.CODI_ACCES,
    name: feature.properties.NOM_ACCES,
    type: feature.properties.TIPUS_ACCES,
    lat: feature.geometry.coordinates[1],
    lng: feature.geometry.coordinates[0],
    raw: feature.properties
  }));
};

export const getMetroStationCorrespondences = async (lineCode, stationCode) => {
  const data = await fetchTMB(`/linies/metro/${lineCode}/estacions/${stationCode}/corresp`);
  return data.features;
};


export const getBusStopFurniture = async (stopCode) => {
  const data = await fetchTMB(`/parades/${stopCode}/mobiliari`);
  return data.features;
};

export const getNearbyBusStops = async (lat, lng, radiusMeters = 500) => {
  const allStops = await getAllBusStops();
  

  return allStops
    .map(stop => ({
      ...stop,
      distance: calculateDistance(lat, lng, stop.lat, stop.lng)
    }))
    .filter(stop => stop.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance);
};


export const getNearbyMetroStations = async (lat, lng, radiusMeters = 1000) => {
  const allStations = await getAllMetroStations();

  return allStations
    .map(station => ({
      ...station,
      distance: calculateDistance(lat, lng, station.lat, station.lng)
    }))
    .filter(station => station.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance);
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

export const testTMBConnection = async () => {
  try {
    const data = await fetchTMB('/linies/bus');
    console.log('✅ TMB API Connection OK');
    return { success: true, lines: data.features.length };
  } catch (error) {
    console.error('❌ TMB API Connection Failed:', error.message);
    return { success: false, error: error.message };
  }
};

export default {
  getAllBusStops,
  getBusLineStops,
  getAllBusLines,
  getAllMetroStations,
  getMetroLineStations,
  getAllMetroLines,
  getBusLineSchedules,
  getBusStopSchedule,
  getBusStopPassingTimes,
  getBusStopCorrespondences,
  getMetroStationAccesses,
  getMetroStationCorrespondences,
  getBusStopFurniture,
  getNearbyBusStops,
  getNearbyMetroStations,
  testTMBConnection
};
