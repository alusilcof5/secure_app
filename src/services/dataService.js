/**
 * Servicio para cargar y procesar datos de equipamientos
 */

import { parseCSVAdvanced, detectAndConvertEncoding } from '../utils/csvParser';

// Cargar CSV desde public folder con manejo de encoding
export const loadCSV = async (filename) => {
  try {
    const response = await fetch(`/data/${filename}`);
    const blob = await response.blob();
    const text = await detectAndConvertEncoding(blob);
    return parseCSVAdvanced(text);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
};

// Procesar equipamientos culturales
export const processCulturalEquipments = (data) => {
  return data
    .filter(item => item.geo_epgs_4326_lat && item.geo_epgs_4326_lon)
    .map(item => ({
      id: item.register_id,
      name: item.name,
      type: 'cultural',
      category: item.secondary_filters_name || 'Cultural',
      lat: parseFloat(item.geo_epgs_4326_lat),
      lng: parseFloat(item.geo_epgs_4326_lon),
      address: `${item.addresses_road_name} ${item.addresses_start_street_number}, ${item.addresses_town}`,
      district: item.addresses_district_name,
      neighborhood: item.addresses_neighborhood_name,
      phone: item.values_value || '',
      description: item.values_description || ''
    }));
};

// Procesar restaurantes
export const processRestaurants = (data) => {
  return data
    .filter(item => item.geo_epgs_4326_lat && item.geo_epgs_4326_lon)
    .map(item => ({
      id: item.register_id,
      name: item.name,
      type: 'restaurant',
      category: 'Restaurant',
      lat: parseFloat(item.geo_epgs_4326_lat),
      lng: parseFloat(item.geo_epgs_4326_lon),
      address: `${item.addresses_road_name} ${item.addresses_start_street_number}, ${item.addresses_town}`,
      district: item.addresses_district_name,
      neighborhood: item.addresses_neighborhood_name,
      phone: item.values_value || ''
    }));
};

// Procesar centros de información
export const processInfoCenters = (data) => {
  return data
    .filter(item => item.geo_epgs_4326_lat && item.geo_epgs_4326_lon)
    .map(item => ({
      id: item.register_id,
      name: item.name,
      type: 'info',
      category: 'Centro de Información',
      lat: parseFloat(item.geo_epgs_4326_lat),
      lng: parseFloat(item.geo_epgs_4326_lon),
      address: `${item.addresses_road_name} ${item.addresses_start_street_number}, ${item.addresses_town}`,
      district: item.addresses_district_name,
      neighborhood: item.addresses_neighborhood_name,
      phone: item.values_value || ''
    }));
};

// Cargar desde API de Catalunya
export const loadFromCatalunyaAPI = async (endpoint) => {
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    
    // El formato de respuesta de Socrata es diferente
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  } catch (error) {
    console.error('Error loading from Catalunya API:', error);
    return [];
  }
};

// Procesar equipamientos de la API de Catalunya (dataset 48s6-82h2)
export const processEquipamentsCatalunya = (data) => {
  return data
    .filter(item => item.latitud && item.longitud)
    .map(item => ({
      id: item.codi || Math.random().toString(36).substr(2, 9),
      name: item.nom_equipament || item.denominaci || 'Sin nombre',
      type: 'equipament',
      category: item.tipus_equipament || 'Equipamiento',
      lat: parseFloat(item.latitud),
      lng: parseFloat(item.longitud),
      address: item.adreca || item.adre_a || '',
      municipality: item.nom_municipi || item.municipi || '',
      comarca: item.nom_comarca || ''
    }));
};

// Procesar población de la API de Catalunya (dataset 8gmd-gz7i)
export const processPopulationCatalunya = (data) => {
  return data.map(item => ({
    municipality: item.nom_municipi || item.municipi,
    population: parseInt(item.poblaci_total || item.poblacio || 0),
    year: item.any || new Date().getFullYear()
  }));
};

// Función principal para cargar todos los datos
export const loadAllData = async () => {
  console.log('🔄 Cargando datos...');
  
  const [
    culturalData,
    restaurantData,
    infoCenterData,
    equipamentsCatData,
    populationData
  ] = await Promise.all([
    loadCSV('opendatabcn_llista-equipaments_cultura-csv.csv'),
    loadCSV('opendatabcn_restaurants_restaurants-csv.csv'),
    loadCSV('opendatabcn_llista-equipaments_centres-informacio-csv.csv'),
    loadFromCatalunyaAPI('https://analisi.transparenciacatalunya.cat/api/v3/views/48s6-82h2/query.json'),
    loadFromCatalunyaAPI('https://analisi.transparenciacatalunya.cat/api/v3/views/8gmd-gz7i/query.json')
  ]);

  const cultural = processCulturalEquipments(culturalData);
  const restaurants = processRestaurants(restaurantData);
  const infoCenters = processInfoCenters(infoCenterData);
  const equipaments = processEquipamentsCatalunya(equipamentsCatData);
  const population = processPopulationCatalunya(populationData);

  console.log('✅ Datos cargados:', {
    cultural: cultural.length,
    restaurants: restaurants.length,
    infoCenters: infoCenters.length,
    equipaments: equipaments.length,
    population: population.length
  });

  return {
    cultural,
    restaurants,
    infoCenters,
    equipaments,
    population,
    all: [...cultural, ...restaurants, ...infoCenters, ...equipaments]
  };
};
