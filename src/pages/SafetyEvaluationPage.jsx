import React, { useState, useEffect } from 'react';

/**
 * Página de Evaluación de Seguridad del Entorno
 */
export default function SafetyEvaluationPage() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [evaluationStep, setEvaluationStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [riskLevel, setRiskLevel] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [savedEvaluations, setSavedEvaluations] = useState([]);

    useEffect(() => {
    const saved = localStorage.getItem('safetyEvaluations');
    if (saved) {
      setSavedEvaluations(JSON.parse(saved));
    }
  }, []);

  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date()
        });
      },
      (error) => console.error('Error obteniendo ubicación:', error)
    );
  }, []);

  const evaluationQuestions = [
    {
      id: 'time',
      question: '¿Qué hora es?',
      type: 'select',
      options: [
        { value: 'day', label: '🌞 Día (6:00 - 20:00)', risk: 0 },
        { value: 'evening', label: '🌆 Atardecer/Anochecer (20:00 - 23:00)', risk: 1 },
        { value: 'night', label: '🌙 Noche (23:00 - 6:00)', risk: 3 }
      ]
    },
    {
      id: 'people',
      question: '¿Cuánta gente hay alrededor?',
      type: 'select',
      options: [
        { value: 'crowded', label: '👥👥👥 Muy concurrido', risk: 0 },
        { value: 'moderate', label: '👥👥 Algunas personas', risk: 1 },
        { value: 'few', label: '👤 Poca gente', risk: 2 },
        { value: 'alone', label: '🚶‍♀️ Estoy sola', risk: 3 }
      ]
    },
    {
      id: 'lighting',
      question: '¿Cómo está la iluminación?',
      type: 'select',
      options: [
        { value: 'bright', label: '💡 Muy iluminado', risk: 0 },
        { value: 'moderate', label: '🔆 Iluminación moderada', risk: 1 },
        { value: 'dim', label: '🕯️ Poca luz', risk: 2 },
        { value: 'dark', label: '🌑 Muy oscuro', risk: 3 }
      ]
    },
    {
      id: 'area',
      question: '¿Qué tipo de zona es?',
      type: 'select',
      options: [
        { value: 'commercial', label: '🏪 Zona comercial activa', risk: 0 },
        { value: 'residential', label: '🏘️ Zona residencial', risk: 1 },
        { value: 'industrial', label: '🏭 Zona industrial', risk: 2 },
        { value: 'isolated', label: '🌳 Zona aislada', risk: 3 }
      ]
    },
    {
      id: 'feeling',
      question: '¿Cómo te sientes en este momento?',
      type: 'select',
      options: [
        { value: 'safe', label: '😊 Segura y tranquila', risk: 0 },
        { value: 'alert', label: '👀 Alerta pero tranquila', risk: 1 },
        { value: 'uncomfortable', label: '😰 Incómoda', risk: 2 },
        { value: 'unsafe', label: '😨 Insegura o en peligro', risk: 3 }
      ]
    },
    {
      id: 'transport',
      question: '¿Tienes acceso a transporte seguro?',
      type: 'select',
      options: [
        { value: 'yes-near', label: '✅ Sí, muy cerca', risk: 0 },
        { value: 'yes-walk', label: '🚶‍♀️ Sí, a pocos minutos caminando', risk: 1 },
        { value: 'far', label: '🚶‍♀️🚶‍♀️ Lejos (>10 min)', risk: 2 },
        { value: 'no', label: '❌ No hay transporte disponible', risk: 3 }
      ]
    }
  ];

  const handleResponse = (questionId, value, riskValue) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { value, risk: riskValue }
    }));
  };

  const nextStep = () => {
    if (evaluationStep < evaluationQuestions.length - 1) {
      setEvaluationStep(prev => prev + 1);
    } else {
      calculateRisk();
    }
  };

  const prevStep = () => {
    if (evaluationStep > 0) {
      setEvaluationStep(prev => prev - 1);
    }
  };

  const calculateRisk = () => {
    
    const totalRisk = Object.values(responses).reduce((sum, resp) => sum + resp.risk, 0);
    const maxRisk = evaluationQuestions.length * 3;
    const riskPercentage = (totalRisk / maxRisk) * 100;

    let level, color, emoji, message;
    
    if (riskPercentage < 25) {
      level = 'Seguro';
      color = 'green';
      emoji = '✅';
      message = 'Tu entorno parece seguro. Sigue atenta pero puedes estar tranquila.';
    } else if (riskPercentage < 50) {
      level = 'Precaución';
      color = 'yellow';
      emoji = '⚠️';
      message = 'Mantente alerta. Algunas condiciones requieren precaución.';
    } else if (riskPercentage < 75) {
      level = 'Riesgo Moderado';
      color = 'orange';
      emoji = '🔶';
      message = 'Situación de riesgo moderado. Considera tomar medidas de seguridad.';
    } else {
      level = 'Alto Riesgo';
      color = 'red';
      emoji = '🚨';
      message = 'Situación de alto riesgo. Activa medidas de seguridad inmediatamente.';
    }

    setRiskLevel({ level, color, emoji, message, percentage: riskPercentage });
    generateRecommendations(responses, riskPercentage);
    saveEvaluation({ level, percentage: riskPercentage, responses });
  };

  const generateRecommendations = (responses, riskPercentage) => {
    const recs = [];

    
    if (responses.feeling?.risk >= 2) {
      recs.push({
        priority: 'high',
        icon: '🚨',
        title: 'Confía en tu instinto',
        action: 'Si te sientes insegura, activa el botón de pánico o llama a un contacto de confianza ahora.',
        actionButton: 'Activar Pánico',
        route: '/simulador'
      });
    }

    if (responses.time?.risk >= 2) {
      recs.push({
        priority: 'high',
        icon: '🌙',
        title: 'Es de noche',
        action: 'Considera pedir un taxi o compartir tu ubicación con alguien de confianza.',
        actionButton: 'Compartir Ubicación',
        route: '/simulador'
      });
    }

    if (responses.lighting?.risk >= 2) {
      recs.push({
        priority: 'medium',
        icon: '💡',
        title: 'Poca iluminación',
        action: 'Busca rutas más iluminadas o espera en un lugar con luz hasta que llegue tu transporte.',
        actionButton: 'Ver Rutas Seguras',
        route: '/mapa'
      });
    }

    if (responses.people?.risk >= 2) {
      recs.push({
        priority: 'medium',
        icon: '👥',
        title: 'Zona poco transitada',
        action: 'Dirígete a una zona más concurrida o activa el temporizador de seguridad.',
        actionButton: 'Temporizador',
        route: '/simulador'
      });
    }

    if (responses.transport?.risk >= 2) {
      recs.push({
        priority: 'high',
        icon: '🚕',
        title: 'Transporte limitado',
        action: 'Busca paradas de bus, metro o Bicing cercanas, o solicita un taxi verificado.',
        actionButton: 'Ver Transporte',
        route: '/analisis'
      });
    }

    if (riskPercentage >= 50) {
      recs.push({
        priority: 'high',
        icon: '📞',
        title: 'Mantén contacto',
        action: 'Llama a alguien de confianza y mantén la conversación mientras te desplazas.',
        actionButton: 'Llamada Falsa',
        route: '/simulador'
      });
    }

    if (riskPercentage < 25) {
      recs.push({
        priority: 'low',
        icon: '✨',
        title: 'Todo bien',
        action: 'Sigue disfrutando de tu camino. Recuerda estar siempre atenta a tu entorno.',
        actionButton: null
      });
    }

    setRecommendations(recs);
  };

  const saveEvaluation = (evaluation) => {
    const newEvaluation = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      location: currentLocation,
      ...evaluation
    };

    const updated = [newEvaluation, ...savedEvaluations.slice(0, 49)];
    setSavedEvaluations(updated);
    localStorage.setItem('safetyEvaluations', JSON.stringify(updated));
  };

  const restartEvaluation = () => {
    setEvaluationStep(0);
    setResponses({});
    setRiskLevel(null);
    setRecommendations([]);
  };

  const currentQuestion = evaluationQuestions[evaluationStep];
  const isLastStep = evaluationStep === evaluationQuestions.length - 1;
  const canProceed = responses[currentQuestion?.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🛡️ Evaluación de Seguridad
          </h1>
          <p className="text-gray-600">
            Evalúa tu entorno y recibe recomendaciones personalizadas
          </p>
        </div>

        {!riskLevel ? (
          /* Cuestionario */
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Pregunta {evaluationStep + 1} de {evaluationQuestions.length}</span>
                <span>{Math.round(((evaluationStep + 1) / evaluationQuestions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((evaluationStep + 1) / evaluationQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {currentQuestion.question}
              </h3>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleResponse(currentQuestion.id, option.value, option.risk)}
                    className={`w-full px-6 py-4 rounded-xl text-left transition-all ${
                      responses[currentQuestion.id]?.value === option.value
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border-2 border-gray-200'
                    }`}
                  >
                    <span className="text-lg">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              {evaluationStep > 0 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  ← Anterior
                </button>
              )}
              
              <button
                onClick={isLastStep ? calculateRisk : nextStep}
                disabled={!canProceed}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLastStep ? 'Ver Resultado 📊' : 'Siguiente →'}
              </button>
            </div>
          </div>
        ) : (
          /* Resultado */
          <div className="space-y-6">
            {/* Risk Level */}
            <div className={`bg-${riskLevel.color}-50 border-l-4 border-${riskLevel.color}-500 rounded-xl p-6`}>
              <div className="flex items-start gap-4">
                <div className="text-5xl">{riskLevel.emoji}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Nivel de Riesgo: {riskLevel.level}
                  </h3>
                  <p className="text-gray-700 mb-4">{riskLevel.message}</p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`bg-${riskLevel.color}-500 h-3 rounded-full`}
                      style={{ width: `${riskLevel.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                📋 Recomendaciones Personalizadas
              </h3>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className={`border-l-4 rounded-lg p-4 ${
                      rec.priority === 'high' ? 'bg-red-50 border-red-500' :
                      rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                      'bg-green-50 border-green-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{rec.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">{rec.title}</h4>
                        <p className="text-sm text-gray-700 mb-2">{rec.action}</p>
                        {rec.actionButton && (
                          <button 
                            onClick={() => window.location.hash = rec.route}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                          >
                            {rec.actionButton}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={restartEvaluation}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                🔄 Nueva Evaluación
              </button>
              <button
                onClick={() => window.location.hash = '/simulador'}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                🛡️ Ir a Herramientas de Seguridad
              </button>
            </div>

            {/* Location info */}
            {currentLocation && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  📍 <strong>Ubicación guardada:</strong><br/>
                  {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}<br/>
                  ⏰ {new Date().toLocaleString('es-ES')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {savedEvaluations.length > 0 && !riskLevel && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              📊 Evaluaciones Anteriores
            </h3>
            <div className="space-y-3">
              {savedEvaluations.slice(0, 5).map((evaluation) => {
                const date = new Date(evaluation.timestamp);
                return (
                  <div key={evaluation.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {evaluation.level} ({Math.round(evaluation.percentage)}%)
                        </div>
                        <div className="text-sm text-gray-600">
                          📅 {date.toLocaleDateString('es-ES')} - 
                          ⏰ {date.toLocaleTimeString('es-ES')}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        evaluation.percentage < 25 ? 'bg-green-100 text-green-800' :
                        evaluation.percentage < 50 ? 'bg-yellow-100 text-yellow-800' :
                        evaluation.percentage < 75 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {evaluation.level}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
