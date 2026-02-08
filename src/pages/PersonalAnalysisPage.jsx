import React, { useState, useEffect } from 'react';

/**
 * Página de Análisis de Seguridad Personal
 * Muestra estadísticas, patrones y recomendaciones basadas en el historial de la usuaria
 */
export default function PersonalAnalysisPage() {
  const [stats, setStats] = useState(null);
  const [safetyScore, setSafetyScore] = useState(0);
  const [insights, setInsights] = useState([]);
  const [riskPatterns, setRiskPatterns] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    loadAndAnalyzeData();
  }, []);

  const loadAndAnalyzeData = () => {
    // Cargar datos históricos
    const evaluations = JSON.parse(localStorage.getItem('safetyEvaluations') || '[]');
    const panicHistory = JSON.parse(localStorage.getItem('secureAppHistory') || '[]');
    const communityReports = JSON.parse(localStorage.getItem('communityReports') || '[]');

    // Calcular estadísticas
    const calculatedStats = {
      totalEvaluations: evaluations.length,
      panicActivations: panicHistory.length,
      communityContributions: communityReports.filter(r => !r.isAnonymous).length,
      averageRiskLevel: evaluations.length > 0
        ? evaluations.reduce((sum, e) => sum + e.percentage, 0) / evaluations.length
        : 0,
      lastEvaluation: evaluations.length > 0 ? new Date(evaluations[0].timestamp) : null,
      mostCommonRiskFactor: getMostCommonRiskFactor(evaluations),
      safeRoutes: calculateSafeRoutes(evaluations),
      highRiskTimes: analyzeRiskByTime(evaluations)
    };

    setStats(calculatedStats);

    
    const score = calculateSafetyScore(calculatedStats, evaluations, panicHistory);
    setSafetyScore(score);

    const generatedInsights = generateInsights(calculatedStats, evaluations, panicHistory);
    setInsights(generatedInsights);

    
    const patterns = identifyRiskPatterns(evaluations);
    setRiskPatterns(patterns);

    
    const recs = generatePersonalizedRecommendations(calculatedStats, patterns, score);
    setRecommendations(recs);
  };

  const getMostCommonRiskFactor = (evaluations) => {
    if (evaluations.length === 0) return null;

    const factors = {};
    evaluations.forEach(evaluation => {
      Object.entries(evaluation.responses || {}).forEach(([key, response]) => {
        if (response.risk >= 2) {
          factors[key] = (factors[key] || 0) + 1;
        }
      });
    });

    const sortedFactors = Object.entries(factors).sort((a, b) => b[1] - a[1]);
    return sortedFactors.length > 0 ? sortedFactors[0][0] : null;
  };

  const calculateSafeRoutes = (evaluations) => {
    const safeEvals = evaluations.filter(e => e.percentage < 25);
    return safeEvals.length;
  };

  const analyzeRiskByTime = (evaluations) => {
    const timeRisks = { morning: [], afternoon: [], evening: [], night: [] };
    
    evaluations.forEach(evaluation => {
      const hour = new Date(evaluation.timestamp).getHours();
      const category = 
        hour >= 6 && hour < 12 ? 'morning' :
        hour >= 12 && hour < 18 ? 'afternoon' :
        hour >= 18 && hour < 22 ? 'evening' : 'night';
      
      timeRisks[category].push(evaluation.percentage);
    });

    return Object.entries(timeRisks).map(([period, risks]) => ({
      period,
      averageRisk: risks.length > 0 ? risks.reduce((a, b) => a + b, 0) / risks.length : 0,
      count: risks.length
    })).filter(t => t.count > 0).sort((a, b) => b.averageRisk - a.averageRisk)[0];
  };

  const calculateSafetyScore = (stats, evaluations, panicHistory) => {
    let score = 70; 

    if (stats.totalEvaluations > 5) score += 10;
    if (stats.communityContributions > 3) score += 5;
    if (stats.averageRiskLevel < 30) score += 10;
    if (panicHistory.length === 0) score += 5;

    if (stats.averageRiskLevel > 60) score -= 15;
    if (panicHistory.length > 3) score -= 10;
    if (stats.totalEvaluations === 0) score -= 20;

    const recentHighRisk = evaluations.filter(e => {
      const daysAgo = (new Date() - new Date(e.timestamp)) / (1000 * 60 * 60 * 24);
      return daysAgo < 7 && e.percentage > 70;
    });
    if (recentHighRisk.length > 0) score -= 10;

    return Math.max(0, Math.min(100, score));
  };

  const generateInsights = (stats, evaluations, panicHistory) => {
    const insights = [];

    // Evaluations insights
    if (stats.totalEvaluations > 0) {
      insights.push({
        type: 'info',
        icon: '📊',
        title: 'Uso de evaluaciones',
        message: `Has realizado ${stats.totalEvaluations} evaluaciones de seguridad. ${
          stats.totalEvaluations >= 10 
            ? '¡Excelente! Estás muy atenta a tu entorno.' 
            : 'Considera hacer más evaluaciones para recibir mejores recomendaciones.'
        }`
      });
    }

    // Risk level insight
    if (stats.averageRiskLevel < 30) {
      insights.push({
        type: 'success',
        icon: '✅',
        title: 'Bajo riesgo general',
        message: 'Tus rutas habituales son generalmente seguras. Continúa siendo precavida.'
      });
    } else if (stats.averageRiskLevel > 60) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Riesgo elevado detectado',
        message: 'Muchas de tus evaluaciones indican situaciones de riesgo. Considera cambiar tus rutas o horarios.'
      });
    }

    if (panicHistory.length === 0) {
      insights.push({
        type: 'success',
        icon: '🛡️',
        title: 'Sin activaciones de pánico',
        message: 'No has necesitado el botón de pánico. ¡Perfecto!'
      });
    } else if (panicHistory.length > 3) {
      insights.push({
        type: 'warning',
        icon: '🚨',
        title: 'Múltiples alertas',
        message: `Has activado el botón de pánico ${panicHistory.length} veces. Considera compartir estas zonas con la comunidad.`
      });
    }

    if (stats.mostCommonRiskFactor) {
      const factorNames = {
        time: 'Horario nocturno',
        people: 'Zonas poco concurridas',
        lighting: 'Iluminación deficiente',
        area: 'Tipo de zona',
        feeling: 'Sensación de inseguridad',
        transport: 'Falta de transporte'
      };

      insights.push({
        type: 'info',
        icon: '🔍',
        title: 'Factor de riesgo principal',
        message: `Tu principal factor de riesgo es: ${factorNames[stats.mostCommonRiskFactor] || stats.mostCommonRiskFactor}`
      });
    }

    if (stats.communityContributions > 5) {
      insights.push({
        type: 'success',
        icon: '🤝',
        title: 'Compromiso comunitario',
        message: '¡Gracias por contribuir a la seguridad de la comunidad con tus reportes!'
      });
    }

    return insights;
  };

  const identifyRiskPatterns = (evaluations) => {
    const patterns = [];

    const nightEvals = evaluations.filter(e => {
      const hour = new Date(e.timestamp).getHours();
      return hour >= 22 || hour < 6;
    });

    if (nightEvals.length > 3) {
      const avgNightRisk = nightEvals.reduce((sum, e) => sum + e.percentage, 0) / nightEvals.length;
      if (avgNightRisk > 50) {
        patterns.push({
          type: 'time',
          severity: 'high',
          icon: '🌙',
          title: 'Alto riesgo nocturno',
          description: 'Detectamos que tus desplazamientos nocturnos suelen ser de mayor riesgo.',
          frequency: nightEvals.length
        });
      }
    }

    const evalsWithLocation = evaluations.filter(e => e.location);
    if (evalsWithLocation.length > 5) {
     
      const clusters = clusterLocations(evalsWithLocation);
      const highRiskClusters = clusters.filter(c => c.averageRisk > 60);
      
      if (highRiskClusters.length > 0) {
        patterns.push({
          type: 'location',
          severity: 'high',
          icon: '📍',
          title: 'Zonas de riesgo recurrentes',
          description: `Identificamos ${highRiskClusters.length} zona(s) donde frecuentemente reportas situaciones de riesgo.`,
          locations: highRiskClusters
        });
      }
    }

    const weekdayRisks = {};
    evaluations.forEach(e => {
      const day = new Date(e.timestamp).getDay();
      if (!weekdayRisks[day]) weekdayRisks[day] = [];
      weekdayRisks[day].push(e.percentage);
    });

    const riskiestDay = Object.entries(weekdayRisks)
      .map(([day, risks]) => ({
        day: parseInt(day),
        avgRisk: risks.reduce((a, b) => a + b, 0) / risks.length,
        count: risks.length
      }))
      .filter(d => d.count >= 2)
      .sort((a, b) => b.avgRisk - a.avgRisk)[0];

    if (riskiestDay && riskiestDay.avgRisk > 50) {
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      patterns.push({
        type: 'weekday',
        severity: 'medium',
        icon: '📅',
        title: 'Patrón semanal',
        description: `Los ${dayNames[riskiestDay.day]}s suelen ser más arriesgados para ti.`,
        day: dayNames[riskiestDay.day]
      });
    }

    return patterns;
  };

  const clusterLocations = (evaluations) => {
    
    const clusters = [];
    const processed = new Set();

    evaluations.forEach((evaluation, i) => {
      if (processed.has(i)) return;

      const cluster = {
        center: evaluation.location,
        evaluations: [evaluation],
        averageRisk: evaluation.percentage
      };

      evaluations.forEach((other, j) => {
        if (i !== j && !processed.has(j)) {
          const distance = calculateDistance(
            evaluation.location.latitude,
            evaluation.location.longitude,
            other.location.latitude,
            other.location.longitude
          );

          if (distance < 500) {
            cluster.evaluations.push(other);
            processed.add(j);
          }
        }
      });

      if (cluster.evaluations.length >= 2) {
        cluster.averageRisk = cluster.evaluations.reduce((sum, e) => sum + e.percentage, 0) / cluster.evaluations.length;
        clusters.push(cluster);
      }

      processed.add(i);
    });

    return clusters;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; 
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const generatePersonalizedRecommendations = (stats, patterns, score) => {
    const recs = [];

    // Based on safety score
    if (score < 50) {
      recs.push({
        priority: 'high',
        icon: '🚨',
        title: 'Score de seguridad bajo',
        action: 'Considera revisar tus rutas habituales y usar más las herramientas de seguridad.',
        tips: [
          'Activa el temporizador cuando salgas',
          'Comparte tu ubicación con contactos de confianza',
          'Usa la red comunitaria para conocer zonas seguras'
        ]
      });
    }

    // Based on patterns
    patterns.forEach(pattern => {
      if (pattern.type === 'time' && pattern.severity === 'high') {
        recs.push({
          priority: 'high',
          icon: '🌙',
          title: 'Desplazamientos nocturnos',
          action: 'Cuando salgas de noche:',
          tips: [
            'Siempre comparte tu ubicación en tiempo real',
            'Usa transporte verificado (taxi, Uber)',
            'Camina por calles principales e iluminadas',
            'Ten el botón de pánico accesible'
          ]
        });
      }

      if (pattern.type === 'location') {
        recs.push({
          priority: 'high',
          icon: '📍',
          title: 'Zonas de riesgo identificadas',
          action: 'Para las zonas que frecuentas con riesgo:',
          tips: [
            'Considera rutas alternativas',
            'Viaja acompañada cuando sea posible',
            'Reporta las zonas en la red comunitaria',
            'Verifica horarios de transporte público'
          ]
        });
      }
    });

    if (stats.communityContributions < 3) {
      recs.push({
        priority: 'medium',
        icon: '🤝',
        title: 'Participa en la comunidad',
        action: 'Comparte tu experiencia:',
        tips: [
          'Reporta zonas seguras que conozcas',
          'Verifica reportes de otras usuarias',
          'Comparte consejos de seguridad'
        ]
      });
    }

    if (stats.totalEvaluations < 5) {
      recs.push({
        priority: 'low',
        icon: '📊',
        title: 'Más evaluaciones = Mejores recomendaciones',
        action: 'Realiza evaluaciones regularmente:',
        tips: [
          'Evalúa tu entorno cuando salgas',
          'Registra diferentes horarios y zonas',
          'Ayúdanos a darte mejores consejos'
        ]
      });
    }

    recs.push({
      priority: 'low',
      icon: '💡',
      title: 'Consejos generales de seguridad',
      action: 'Recuerda siempre:',
      tips: [
        'Confía en tu instinto',
        'Mantén tu teléfono cargado',
        'Evita distracciones (auriculares, móvil)',
        'Camina con confianza y propósito',
        'Ten las llaves preparadas antes de llegar'
      ]
    });

    return recs;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const getScoreEmoji = (score) => {
    if (score >= 80) return '🛡️';
    if (score >= 60) return '✅';
    if (score >= 40) return '⚠️';
    return '🚨';
  };

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🔄</div>
          <p className="text-gray-600">Analizando tus datos...</p>
        </div>
      </div>
    );
  }

  const scoreColor = getScoreColor(safetyScore);
  const scoreEmoji = getScoreEmoji(safetyScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Análisis Personal de Seguridad
          </h1>
          <p className="text-gray-600">
            Insights y recomendaciones basadas en tu historial
          </p>
        </div>

        {/* Safety Score */}
        <div className={`bg-${scoreColor}-50 border-l-4 border-${scoreColor}-500 rounded-2xl shadow-lg p-8 mb-8`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {scoreEmoji} Tu Score de Seguridad
              </h2>
              <p className="text-gray-700">
                Basado en tus evaluaciones, rutas y uso de herramientas de seguridad
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-900">{safetyScore}</div>
              <div className="text-lg text-gray-600">/ 100</div>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`bg-${scoreColor}-500 h-4 rounded-full transition-all duration-500`}
              style={{ width: `${safetyScore}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalEvaluations}</div>
            <div className="text-sm text-gray-600">Evaluaciones realizadas</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-4xl mb-2">🛡️</div>
            <div className="text-3xl font-bold text-gray-900">{stats.safeRoutes}</div>
            <div className="text-sm text-gray-600">Rutas seguras identificadas</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-4xl mb-2">🚨</div>
            <div className="text-3xl font-bold text-gray-900">{stats.panicActivations}</div>
            <div className="text-sm text-gray-600">Activaciones de pánico</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-4xl mb-2">🤝</div>
            <div className="text-3xl font-bold text-gray-900">{stats.communityContributions}</div>
            <div className="text-sm text-gray-600">Reportes a la comunidad</div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">💡 Insights Personalizados</h3>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`border-l-4 rounded-lg p-4 ${
                  insight.type === 'success' ? 'bg-green-50 border-green-500' :
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{insight.icon}</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{insight.title}</h4>
                    <p className="text-gray-700">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Patterns */}
        {riskPatterns.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">🔍 Patrones de Riesgo Detectados</h3>
            <div className="space-y-4">
              {riskPatterns.map((pattern, index) => (
                <div 
                  key={index}
                  className={`border-l-4 rounded-lg p-4 ${
                    pattern.severity === 'high' ? 'bg-red-50 border-red-500' :
                    pattern.severity === 'medium' ? 'bg-orange-50 border-orange-500' :
                    'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{pattern.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">{pattern.title}</h4>
                      <p className="text-gray-700 mb-2">{pattern.description}</p>
                      {pattern.frequency && (
                        <div className="text-sm text-gray-600">
                          Frecuencia: {pattern.frequency} veces
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personalized Recommendations */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">🎯 Recomendaciones Personalizadas</h3>
          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <div 
                key={index}
                className={`border-l-4 rounded-lg p-6 ${
                  rec.priority === 'high' ? 'bg-red-50 border-red-500' :
                  rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{rec.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900 mb-2">{rec.title}</h4>
                    <p className="text-gray-700 mb-3">{rec.action}</p>
                    {rec.tips && (
                      <ul className="space-y-1 text-sm text-gray-600">
                        {rec.tips.map((tip, i) => (
                          <li key={i}>• {tip}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            ¿Quieres mejorar tu seguridad?
          </h3>
          <p className="mb-6">
            Usa todas las herramientas disponibles para moverte con confianza
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => window.location.hash = '/evaluacion'}
              className="px-6 py-3 bg-white text-purple-600 rounded-xl font-medium hover:bg-gray-100 transition"
            >
              📊 Nueva Evaluación
            </button>
            <button
              onClick={() => window.location.hash = '/simulador'}
              className="px-6 py-3 bg-white text-purple-600 rounded-xl font-medium hover:bg-gray-100 transition"
            >
              🛡️ Herramientas de Seguridad
            </button>
            <button
              onClick={() => window.location.hash = '/comunidad'}
              className="px-6 py-3 bg-white text-purple-600 rounded-xl font-medium hover:bg-gray-100 transition"
            >
              🤝 Red Comunitaria
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
