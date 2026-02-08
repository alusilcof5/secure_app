/**
 * Safe Routing Service - Algoritmo inteligente de rutas seguras
 * Calcula rutas optimizando por seguridad usando múltiples factores
 */

// Haversine formula para calcular distancia entre dos puntos GPS
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const calculatePointSafetyScore = (lat, lng) => {
  let score = 100; 
  
  const communityReports = JSON.parse(localStorage.getItem('communityReports') || '[]');
  communityReports.forEach(report => {
    const distance = calculateDistance(lat, lng, report.location[0], report.location[1]);
    
    if (distance < 0.2) { // Menos de 200m
      const reportAge = (Date.now() - new Date(report.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      const relevanceFactor = Math.max(0, 1 - (reportAge / 30)); 
      
      switch(report.type) {
        case 'harassment':
          score -= 30 * relevanceFactor;
          break;
        case 'suspicious':
          score -= 25 * relevanceFactor;
          break;
        case 'isolated':
          score -= 15 * relevanceFactor;
          break;
        case 'lighting':
          score -= 10 * relevanceFactor;
          break;
        case 'safe':
          score += 15 * relevanceFactor;
          break;
      }
    }
  });
  
  
  const evaluations = JSON.parse(localStorage.getItem('safetyEvaluations') || '[]');
  const nearbyEvaluations = evaluations.filter(evaluation => {
    if (!evaluation.location) return false;
    const distance = calculateDistance(lat, lng, evaluation.location.lat, evaluation.location.lng);
    return distance < 0.3; 
  });
  
  if (nearbyEvaluations.length > 0) {
    const avgRisk = nearbyEvaluations.reduce((sum, e) => sum + e.riskScore, 0) / nearbyEvaluations.length;
    score -= avgRisk * 0.3; 
  }
  
  
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 6) {
    score -= 20; 
  } else if (hour >= 6 && hour < 9) {
    score += 10; 
  } else if (hour >= 18 && hour < 22) {
    score -= 10; 
  }
  
  return Math.max(0, Math.min(100, score));
};

const generateWaypoints = (start, end, numberOfPoints = 5) => {
  const waypoints = [];
  
  for (let i = 1; i <= numberOfPoints; i++) {
    const fraction = i / (numberOfPoints + 1);
    const lat = start.lat + (end.lat - start.lat) * fraction;
    const lng = start.lng + (end.lng - start.lng) * fraction;
    
    const variation = 0.002; 
    const randomLat = lat + (Math.random() - 0.5) * variation;
    const randomLng = lng + (Math.random() - 0.5) * variation;
    
    waypoints.push({
      lat: randomLat,
      lng: randomLng,
      safetyScore: calculatePointSafetyScore(randomLat, randomLng)
    });
  }
  
  return waypoints;
};

const calculateRouteSafetyScore = (waypoints) => {
  if (waypoints.length === 0) return 0;
  
  const totalScore = waypoints.reduce((sum, wp) => sum + wp.safetyScore, 0);
  return Math.round(totalScore / waypoints.length);
};


const calculateRouteDistance = (waypoints) => {
  let totalDistance = 0;
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateDistance(
      waypoints[i].lat,
      waypoints[i].lng,
      waypoints[i + 1].lat,
      waypoints[i + 1].lng
    );
  }
  
  return totalDistance;
};


const calculateEstimatedTime = (distanceKm, mode = 'walking') => {
  const speeds = {
    walking: 5,
    transit: 20,
    driving: 30,
    cycling: 15
  };
  
  const hours = distanceKm / speeds[mode];
  const minutes = Math.round(hours * 60);
  
  return { hours, minutes };
};

const identifyDangerousPoints = (waypoints) => {
  return waypoints
    .map((wp, index) => ({ ...wp, index }))
    .filter(wp => wp.safetyScore < 50)
    .map(wp => ({
      ...wp,
      severity: wp.safetyScore < 30 ? 'high' : 'medium'
    }));
};


const findNearestSafeZones = (lat, lng, radius = 0.5) => {
  const safeReports = JSON.parse(localStorage.getItem('communityReports') || '[]')
    .filter(r => r.type === 'safe');
  
  return safeReports
    .map(report => ({
      ...report,
      distance: calculateDistance(lat, lng, report.location[0], report.location[1])
    }))
    .filter(report => report.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);
};

/**
 * FUNCIÓN PRINCIPAL: Calcular múltiples opciones de ruta
 */
export const calculateSafeRoutes = (start, end) => {
  const routes = [];
  
  // RUTA 1: MÁS SEGURA (prioriza seguridad sobre distancia)
  const safeWaypoints = generateWaypoints(start, end, 8);
  // Filtrar puntos peligrosos y reemplazarlos
  const safestWaypoints = safeWaypoints.map(wp => {
    if (wp.safetyScore < 40) {
      // Buscar punto seguro cercano
      const safeZones = findNearestSafeZones(wp.lat, wp.lng, 0.3);
      if (safeZones.length > 0) {
        return {
          lat: safeZones[0].location[0],
          lng: safeZones[0].location[1],
          safetyScore: calculatePointSafetyScore(safeZones[0].location[0], safeZones[0].location[1])
        };
      }
    }
    return wp;
  });
  
  const fullSafeRoute = [start, ...safestWaypoints, end];
  routes.push({
    id: 'safest',
    name: 'Ruta Más Segura',
    description: 'Prioriza tu seguridad evitando zonas de riesgo',
    waypoints: fullSafeRoute,
    safetyScore: calculateRouteSafetyScore(fullSafeRoute),
    distance: calculateRouteDistance(fullSafeRoute),
    estimatedTime: calculateEstimatedTime(calculateRouteDistance(fullSafeRoute)),
    dangerousPoints: identifyDangerousPoints(fullSafeRoute),
    color: '#10b981', // Verde
    icon: '🛡️',
    recommended: true
  });
  
  // RUTA 2: MÁS RÁPIDA (ruta directa)
  const directWaypoints = generateWaypoints(start, end, 3);
  const fullDirectRoute = [start, ...directWaypoints, end];
  routes.push({
    id: 'fastest',
    name: 'Ruta Más Rápida',
    description: 'Camino más directo, menor tiempo de viaje',
    waypoints: fullDirectRoute,
    safetyScore: calculateRouteSafetyScore(fullDirectRoute),
    distance: calculateRouteDistance(fullDirectRoute),
    estimatedTime: calculateEstimatedTime(calculateRouteDistance(fullDirectRoute)),
    dangerousPoints: identifyDangerousPoints(fullDirectRoute),
    color: '#3b82f6', // Azul
    icon: '⚡',
    recommended: false
  });
  
  // RUTA 3: EQUILIBRADA (balance entre seguridad y distancia)
  const balancedWaypoints = generateWaypoints(start, end, 5);
  // Mejorar puntos muy peligrosos pero sin desviarse mucho
  const balancedOptimized = balancedWaypoints.map(wp => {
    if (wp.safetyScore < 30) { // Solo reemplazar puntos MUY peligrosos
      const safeZones = findNearestSafeZones(wp.lat, wp.lng, 0.2);
      if (safeZones.length > 0) {
        return {
          lat: safeZones[0].location[0],
          lng: safeZones[0].location[1],
          safetyScore: calculatePointSafetyScore(safeZones[0].location[0], safeZones[0].location[1])
        };
      }
    }
    return wp;
  });
  
  const fullBalancedRoute = [start, ...balancedOptimized, end];
  routes.push({
    id: 'balanced',
    name: 'Ruta Equilibrada',
    description: 'Balance óptimo entre seguridad y tiempo',
    waypoints: fullBalancedRoute,
    safetyScore: calculateRouteSafetyScore(fullBalancedRoute),
    distance: calculateRouteDistance(fullBalancedRoute),
    estimatedTime: calculateEstimatedTime(calculateRouteDistance(fullBalancedRoute)),
    dangerousPoints: identifyDangerousPoints(fullBalancedRoute),
    color: '#f59e0b', 
    icon: '⚖️',
    recommended: false
  });

  // Ordenar por score de seguridad descendente
  routes.sort((a, b) => b.safetyScore - a.safetyScore);
  
  routes[0].recommended = true;
  
  return routes;
};

/**
 * Obtener recomendaciones de seguridad para una ruta
 */
export const getRouteRecommendations = (route) => {
  const recommendations = [];
  
  // Basado en score de seguridad
  if (route.safetyScore < 40) {
    recommendations.push({
      priority: 'high',
      icon: '🚨',
      message: 'Esta ruta tiene zonas de alto riesgo. Considera usar otra alternativa.',
      action: 'Cambiar ruta'
    });
  } else if (route.safetyScore < 60) {
    recommendations.push({
      priority: 'medium',
      icon: '⚠️',
      message: 'Mantente alerta. Hay algunas zonas con reportes de seguridad.',
      action: 'Ver puntos de riesgo'
    });
  }
  
  // Puntos peligrosos
  if (route.dangerousPoints.length > 0) {
    const highRiskPoints = route.dangerousPoints.filter(p => p.severity === 'high');
    if (highRiskPoints.length > 0) {
      recommendations.push({
        priority: 'high',
        icon: '📍',
        message: `${highRiskPoints.length} zona(s) de alto riesgo en esta ruta.`,
        action: 'Ver detalles'
      });
    }
  }
  
  // Hora del día
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 6) {
    recommendations.push({
      priority: 'high',
      icon: '🌙',
      message: 'Es de noche. Comparte tu ubicación con contactos de confianza.',
      action: 'Compartir ubicación'
    });
  }
  
  // Distancia larga
  if (route.distance > 2) {
    recommendations.push({
      priority: 'medium',
      icon: '🚌',
      message: 'Ruta larga. Considera usar transporte público.',
      action: 'Ver opciones de transporte'
    });
  }
  
  // Sin reportes recientes (puede ser bueno o malo)
  const recentReports = JSON.parse(localStorage.getItem('communityReports') || '[]')
    .filter(r => {
      const age = (Date.now() - new Date(r.timestamp).getTime()) / (1000 * 60 * 60);
      return age < 24; // Últimas 24 horas
    });
  
  if (recentReports.length === 0 && route.safetyScore > 70) {
    recommendations.push({
      priority: 'low',
      icon: '✅',
      message: 'Sin incidentes reportados recientemente en esta zona.',
      action: null
    });
  }
  
  return recommendations;
};

/**
 * Guardar ruta en historial
 */
export const saveRouteToHistory = (route, start, end) => {
  const history = JSON.parse(localStorage.getItem('routeHistory') || '[]');
  
  const routeRecord = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    start: {
      lat: start.lat,
      lng: start.lng,
      address: start.address || 'Ubicación de inicio'
    },
    end: {
      lat: end.lat,
      lng: end.lng,
      address: end.address || 'Destino'
    },
    selectedRoute: route.id,
    safetyScore: route.safetyScore,
    distance: route.distance,
    duration: route.estimatedTime.minutes
  };
  
  history.unshift(routeRecord);
  
  // Mantener solo las últimas 50 rutas
  if (history.length > 50) {
    history.pop();
  }
  
  localStorage.setItem('routeHistory', JSON.stringify(history));
};

/**
 * Obtener estadísticas de uso de rutas
 */
export const getRouteStatistics = () => {
  const history = JSON.parse(localStorage.getItem('routeHistory') || '[]');
  
  if (history.length === 0) {
    return null;
  }
  
  const avgSafetyScore = history.reduce((sum, r) => sum + r.safetyScore, 0) / history.length;
  const totalDistance = history.reduce((sum, r) => sum + r.distance, 0);
  const safeRoutesCount = history.filter(r => r.safetyScore > 70).length;
  const riskyRoutesCount = history.filter(r => r.safetyScore < 40).length;
  
  return {
    totalRoutes: history.length,
    avgSafetyScore: Math.round(avgSafetyScore),
    totalDistance: totalDistance.toFixed(1),
    safeRoutesPercentage: Math.round((safeRoutesCount / history.length) * 100),
    riskyRoutesPercentage: Math.round((riskyRoutesCount / history.length) * 100),
    mostCommonStartArea: findMostCommonArea(history.map(r => r.start)),
    mostCommonEndArea: findMostCommonArea(history.map(r => r.end))
  };
};

// Helper para encontrar área más común
const findMostCommonArea = (locations) => {
  // Simplificación: agrupar por coordenadas redondeadas
  const areas = {};
  
  locations.forEach(loc => {
    const key = `${loc.lat.toFixed(2)},${loc.lng.toFixed(2)}`;
    areas[key] = (areas[key] || 0) + 1;
  });
  
  const mostCommon = Object.entries(areas).sort((a, b) => b[1] - a[1])[0];
  return mostCommon ? mostCommon[0] : 'Desconocido';
};

export default {
  calculateSafeRoutes,
  getRouteRecommendations,
  saveRouteToHistory,
  getRouteStatistics,
  calculatePointSafetyScore
};
