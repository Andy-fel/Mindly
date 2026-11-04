import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const TRIAGE_COLLECTION = 'users_metadata';
export const STORAGE_KEY_QUESTIONS = 'mindly_triage_custom_questions';
export const STORAGE_KEY_LOCAL_TRIAGE = 'mindly_user_triage_cache';

// Preguntas base de los 4 ejes clínicos
export const DEFAULT_TRIAGE_QUESTIONS = [
  // Eje 1: Estilo de Comunicación Deseado
  {
    id: 'eje1_q1',
    axisId: 1,
    axisTitle: 'Eje 1: Estilo de Comunicación Deseado',
    axisDescription: 'Configura cómo la IA debe interactuar contigo para que te sientas comprendido/a.',
    question: '¿Cómo prefieres que la IA se dirija a ti durante las sesiones?',
    category: 'communicationStyle',
    options: [
      { id: 'A', text: 'Directo y práctico (enfocado en soluciones rápidas).', value: 'Directo y práctico', tag: 'Directo' },
      { id: 'B', text: 'Empático y reflexivo (preguntas abiertas para desahogarme).', value: 'Empático y reflexivo', tag: 'Empático' },
      { id: 'C', text: 'Educativo (explicándome qué le pasa a mi cerebro/mente).', value: 'Educativo y explicativo', tag: 'Educativo' }
    ]
  },
  {
    id: 'eje1_q2',
    axisId: 1,
    axisTitle: 'Eje 1: Estilo de Comunicación Deseado',
    axisDescription: 'Personalización de la síntesis de voz y presencia sonora.',
    question: '¿Qué tono de voz prefieres en la interacción por voz (A.I.S.E)?',
    category: 'voiceTone',
    options: [
      { id: 'A', text: 'Cálido y pausado.', value: 'Cálido y pausado', tag: 'Pausado' },
      { id: 'B', text: 'Neutral y profesional.', value: 'Neutral y profesional', tag: 'Neutral' },
      { id: 'C', text: 'Dinámico y motivador.', value: 'Dinámico y motivador', tag: 'Motivador' }
    ]
  },

  // Eje 2: Presentación de Síntomas y Desencadenantes
  {
    id: 'eje2_q1',
    axisId: 2,
    axisTitle: 'Eje 2: Presentación de Síntomas y Desencadenantes',
    axisDescription: 'Identificación de motivos de consulta y factores de tensión inmediata.',
    question: '¿Cuál es el motivo principal por el que buscas apoyo hoy?',
    category: 'primaryReason',
    options: [
      { id: 'A', text: 'Estrés académico / laboral.', value: 'Estrés académico / laboral', tag: 'Estrés' },
      { id: 'B', text: 'Ansiedad o ataques de pánico frecuentes.', value: 'Ansiedad o ataques de pánico frecuentes', tag: 'Ansiedad' },
      { id: 'C', text: 'Estado de ánimo bajo o tristeza prolongada.', value: 'Estado de ánimo bajo o tristeza prolongada', tag: 'Ánimo Bajo' },
      { id: 'D', text: 'Dificultad para gestionar emociones o relaciones.', value: 'Dificultad para gestionar emociones o relaciones', tag: 'Gestión Emocional' }
    ]
  },
  {
    id: 'eje2_q2',
    axisId: 2,
    axisTitle: 'Eje 2: Presentación de Síntomas y Desencadenantes',
    axisDescription: 'Medición del impacto funcional de los síntomas en tu rutina diaria.',
    question: '¿Con qué frecuencia sientes que tus emociones interfieren en tu día a día?',
    category: 'emotionalInterference',
    options: [
      { id: 'A', text: 'Rara vez.', value: 'Rara vez', severity: 1 },
      { id: 'B', text: 'A veces.', value: 'A veces', severity: 2 },
      { id: 'C', text: 'Con frecuencia.', value: 'Con frecuencia', severity: 3 },
      { id: 'D', text: 'Casi todo el tiempo.', value: 'Casi todo el tiempo', severity: 4 }
    ]
  },

  // Eje 3: Recursos Personales y Afrontamiento
  {
    id: 'eje3_q1',
    axisId: 3,
    axisTitle: 'Eje 3: Recursos Personales y Afrontamiento',
    axisDescription: 'Estrategias actuales de autorregulación y resolución de problemas.',
    question: 'Cuando te sientes abrumado/a, ¿qué sueles hacer habitualmente?',
    category: 'copingMechanism',
    options: [
      { id: 'A', text: 'Aislarme de los demás.', value: 'Aislarme de los demás', adaptive: false, label: 'Aislamiento social' },
      { id: 'B', text: 'Busco distracción (pantallas, juegos).', value: 'Busco distracción (pantallas, juegos)', adaptive: false, label: 'Distracción evasiva' },
      { id: 'C', text: 'Busco a un amigo/familiar.', value: 'Busco a un amigo/familiar', adaptive: true, label: 'Búsqueda de apoyo social' },
      { id: 'D', text: 'Intento resolver el problema de inmediato.', value: 'Intento resolver el problema de inmediato', adaptive: true, label: 'Enfoque proactivo' }
    ]
  },
  {
    id: 'eje3_q2',
    axisId: 3,
    axisTitle: 'Eje 3: Recursos Personales y Afrontamiento',
    axisDescription: 'Disponibilidad de factores protectores externos.',
    question: '¿Cuenta con una red de apoyo cercana (familiares, amigos) con quien hablar de lo que sientes?',
    category: 'supportNetwork',
    options: [
      { id: 'A', text: 'Sí, fuerte.', value: 'Sí, fuerte', protection: 'Fuerte' },
      { id: 'B', text: 'Limitada.', value: 'Limitada', protection: 'Moderada' },
      { id: 'C', text: 'No cuento con nadie.', value: 'No cuento con nadie', protection: 'Vulnerable' }
    ]
  },
  {
    id: 'eje3_q3',
    axisId: 3,
    axisTitle: 'Eje 3: Recursos Personales y Afrontamiento',
    axisDescription: 'Preferencia de intervenciones psicológicas y técnicas de regulación.',
    question: '¿Qué tipo de ejercicios o herramientas te resultan más útiles?',
    category: 'preferredTools',
    options: [
      { id: 'A', text: 'Respiración y meditación guiada.', value: 'Respiración y meditación guiada', technique: 'Mindfulness y Somático' },
      { id: 'B', text: 'Reestructurar o escribir mis pensamientos.', value: 'Reestructurar o escribir mis pensamientos', technique: 'CBT y Reestructuración Cognitiva' },
      { id: 'C', text: 'Tareas o metas pequeñas para el día a día.', value: 'Tareas o metas pequeñas para el día a día', technique: 'Activación Conductual' }
    ]
  },

  // Eje 4: Indicadores Pronósticos y Banderas Rojas (Filtro de Seguridad)
  {
    id: 'eje4_q1',
    axisId: 4,
    axisTitle: 'Eje 4: Indicadores Pronósticos y Banderas Rojas (Filtro de Seguridad)',
    axisDescription: 'Historial clínico y contacto previo con psicoterapia formal.',
    question: '¿Has asistido o estás asistiendo actualmente a terapia psicológica humana?',
    category: 'priorTherapy',
    options: [
      { id: 'A', text: 'Sí, actualmente.', value: 'Sí, actualmente', status: 'En tratamiento activo' },
      { id: 'B', text: 'En el pasado.', value: 'En el pasado', status: 'Experiencia previa' },
      { id: 'C', text: 'Nunca.', value: 'Nunca', status: 'Primer contacto terapéutico' }
    ]
  },
  {
    id: 'eje4_q2',
    axisId: 4,
    axisTitle: 'Eje 4: Indicadores Pronósticos y Banderas Rojas (Filtro de Seguridad)',
    axisDescription: 'Nivel de motivación para la tarea intersesión y compromiso reflexivo.',
    question: '¿Qué tan dispuesto/a te sientes a realizar pequeños ejercicios prácticos entre sesiones?',
    category: 'motivation',
    options: [
      { id: 'A', text: 'Muy dispuesto/a.', value: 'Muy dispuesto/a', score: 3 },
      { id: 'B', text: 'Moderadamente.', value: 'Moderadamente', score: 2 },
      { id: 'C', text: 'Prefiero solo hablar.', value: 'Prefiero solo hablar', score: 1 }
    ]
  },
  {
    id: 'eje4_q3',
    axisId: 4,
    axisTitle: 'Eje 4: Indicadores Pronósticos y Banderas Rojas (Filtro de Seguridad)',
    axisDescription: 'Filtro Centinela de seguridad para prevención oportuna de autolesión o ideación de riesgo.',
    question: '(Filtro Centinela) En las últimas dos semanas, ¿has tenido pensamientos recurrente de hacerte daño o que la vida no vale la pena?',
    category: 'sentinelRisk',
    isSentinel: true,
    options: [
      { id: 'A', text: 'No, en absoluto.', value: 'No, en absoluto', risk: 'Bajo', isTrigger: false },
      { id: 'B', text: 'Ocasionalmente, pero sin intención.', value: 'Ocasionalmente, pero sin intención', risk: 'Moderado', isTrigger: false },
      { id: 'C', text: 'Sí, con frecuencia. (Dispara alerta preventiva inmediata).', value: 'Sí, con frecuencia', risk: 'Alto', isTrigger: true }
    ]
  }
];

// ─── Gestión de Preguntas Dinámicas (CRUD) ───────────────────────────────────

export const getStoredQuestions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUESTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error al cargar preguntas guardadas:', e);
  }
  return DEFAULT_TRIAGE_QUESTIONS;
};

export const saveStoredQuestions = (questions) => {
  try {
    localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(questions));
    return true;
  } catch (e) {
    console.error('Error al guardar preguntas:', e);
    return false;
  }
};

export const resetStoredQuestions = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_QUESTIONS);
    return DEFAULT_TRIAGE_QUESTIONS;
  } catch (e) {
    console.error('Error al reiniciar preguntas:', e);
    return DEFAULT_TRIAGE_QUESTIONS;
  }
};

// ─── Algoritmo de Triage Clínico y Análisis RAG ──────────────────────────────

export const calculateTriageAnalysis = (answers = {}, questions = DEFAULT_TRIAGE_QUESTIONS) => {
  // Mapear respuestas con las preguntas correspondientes
  const questionMap = {};
  questions.forEach(q => {
    questionMap[q.id] = q;
  });

  const getAnswerObj = (qid) => {
    const q = questionMap[qid];
    if (!q) return null;
    const ansId = answers[qid];
    if (!ansId) return null;
    return q.options.find(o => o.id === ansId || o.value === ansId) || null;
  };

  // Eje 1: Estilo de comunicación y tono
  const commOpt = getAnswerObj('eje1_q1');
  const toneOpt = getAnswerObj('eje1_q2');

  const communicationStyle = commOpt?.value || 'Empático y reflexivo';
  const voiceTone = toneOpt?.value || 'Cálido y pausado';

  // Eje 2: Síntomas y desencadenantes
  const reasonOpt = getAnswerObj('eje2_q1');
  const interfOpt = getAnswerObj('eje2_q2');

  const primaryReason = reasonOpt?.value || 'Gestión emocional y estrés';
  const emotionalInterference = interfOpt?.value || 'A veces';
  const interferenceSeverity = interfOpt?.severity || 2;

  // Eje 3: Afrontamiento y redes
  const copingOpt = getAnswerObj('eje3_q1');
  const supportOpt = getAnswerObj('eje3_q2');
  const toolsOpt = getAnswerObj('eje3_q3');

  const copingMechanism = copingOpt?.value || 'Búsqueda de distracción';
  const supportNetwork = supportOpt?.value || 'Limitada';
  const preferredTools = toolsOpt?.value || 'Respiración y meditación guiada';

  // Eje 4: Pronóstico y Filtro Centinela
  const therapyOpt = getAnswerObj('eje4_q1');
  const motivOpt = getAnswerObj('eje4_q2');
  const sentinelOpt = getAnswerObj('eje4_q3');

  const priorTherapy = therapyOpt?.value || 'Nunca';
  const motivation = motivOpt?.value || 'Moderadamente';
  const sentinelAnswer = sentinelOpt?.value || 'No, en absoluto';

  // Detección de Banderas Rojas y Riesgo
  const isSentinelTriggered = sentinelOpt?.isTrigger || sentinelOpt?.id === 'C' || (typeof sentinelAnswer === 'string' && sentinelAnswer.toLowerCase().includes('con frecuencia'));

  let riskLevel = 'Bajo';
  let riskBadgeColor = 'emerald';
  let clinicalRiskDescription = 'Paciente con bajo nivel de riesgo inmediato. Foco en psicoeducación y regulación emocional.';

  if (isSentinelTriggered) {
    riskLevel = 'Alto Riesgo (Alerta Centinela)';
    riskBadgeColor = 'rose';
    clinicalRiskDescription = 'Bandera Centinela Activa: El paciente reporta pensamientos recurrentes de daño. Se requiere protocolo de seguridad activo y priorización de líneas de contención.';
  } else if (interferenceSeverity >= 3 || supportOpt?.protection === 'Vulnerable') {
    riskLevel = 'Moderado';
    riskBadgeColor = 'amber';
    clinicalRiskDescription = 'Riesgo Moderado: Alta interferencia en la vida diaria o red de apoyo limitada. Se recomienda monitoreo cercano y ejercicios de afrontamiento proactivos.';
  }

  // Matriz de Indicadores Pronósticos (Introspección, Motivación, Red de Apoyo)
  // 1. Introspección
  let introspectionScore = 'Media';
  let introspectionDesc = 'Capacidad reflexiva funcional; reconoce motivos emocionales principales.';
  if (communicationStyle.includes('Educativo') || copingOpt?.adaptive || preferredTools.includes('Reestructurar')) {
    introspectionScore = 'Alta';
    introspectionDesc = 'Elevada apertura al insight, cuestionamiento cognitivo y análisis de estados internos.';
  } else if (copingOpt?.value?.includes('Aislarme') && interferenceSeverity >= 4) {
    introspectionScore = 'Baja a Moderada';
    introspectionDesc = 'Tiende a la evitación cuando se siente sobrecargado/a; requiere guía paso a paso.';
  }

  // 2. Motivación
  let motivationScore = 'Moderada';
  let motivationDesc = 'Disposición favorable para conversar e integrar pautas graduales.';
  if (motivOpt?.score === 3 || motivOpt?.id === 'A') {
    motivationScore = 'Alta';
    motivationDesc = 'Muy receptivo/a a tareas prácticas intersesión y autorregulación activa.';
  } else if (motivOpt?.score === 1 || motivOpt?.id === 'C') {
    motivationScore = 'Contemplativa / Exclusiva de Ventilación';
    motivationDesc = 'Prefiere espacio de escucha activa y desahogo antes de comprometerse con tareas conductuales.';
  }

  // 3. Redes de Apoyo
  let supportProtection = supportOpt?.protection || 'Moderada';
  let supportDesc = supportNetwork.includes('fuerte')
    ? 'Cuenta con un círculo de confianza sólido como factor protector primario.'
    : supportNetwork.includes('nadie')
    ? 'Aislamiento relacional: factor de vulnerabilidad que incrementa la relevancia de Mindly y de recursos de contención.'
    : 'Red relacional presente pero con reservas para exteriorizar vulnerabilidad.';

  // Generación del Prompt de RAG para inyectar en Gemini / AISE
  const aiSystemPromptExtension = [
    `=== EXPEDIENTE CLÍNICO TRIAGE & ADAPTACIÓN PSICOLÓGICA (users_metadata) ===`,
    `[Estilo de Comunicación Requerido]: ${communicationStyle}. ${
      communicationStyle.includes('Directo')
        ? 'Sé pragmático, conciso y ofrece soluciones paso a paso sin rodeos.'
        : communicationStyle.includes('Educativo')
        ? 'Explica brevemente la neurobiología o la psicología detrás de sus síntomas para darle claridad.'
        : 'Sé profundamente cálido, valida sus sentimientos con preguntas abiertas y bríndale espacio para desahogarse.'
    }`,
    `[Tono de Voz AISE]: ${voiceTone}.`,
    `[Motivo Principal de Apoyo]: ${primaryReason} (Interferencia emocional: ${emotionalInterference}).`,
    `[Mecanismo de Afrontamiento Habitual]: ${copingMechanism}.`,
    `[Red de Apoyo]: ${supportNetwork} (${supportProtection}).`,
    `[Herramientas Psicológicas Preferidas]: ${preferredTools}. Prioriza este tipo de técnicas en tus recomendaciones.`,
    `[Indicadores Pronósticos]: Introspección ${introspectionScore} | Motivación ${motivationScore}.`,
    `[Alerta Centinela / Nivel de Riesgo]: ${riskLevel}. ${
      isSentinelTriggered
        ? 'ATENCIÓN CRÍTICA: Se detectó ideación de riesgo en el test. Mantén un tono sumamente empático, NO minimices el dolor, y ante cualquier indicio de crisis ofrece pausar y acudir al Panel de Emergencias SOS o línea 106.'
        : 'Mantén el protocolo habitual de contención y mindfulness.'
    }`,
    `========================================================================`
  ].join('\n');

  return {
    completedAt: new Date().toISOString(),
    answers,
    riskLevel,
    riskBadgeColor,
    isSentinelTriggered,
    clinicalRiskDescription,
    prognosticMatrix: {
      introspection: { score: introspectionScore, description: introspectionDesc },
      motivation: { score: motivationScore, description: motivationDesc },
      supportNetwork: { status: supportNetwork, protection: supportProtection, description: supportDesc },
      priorTherapy: { status: priorTherapy }
    },
    personalityTraits: {
      communicationStyle,
      voiceTone,
      primaryReason,
      emotionalInterference,
      copingMechanism,
      preferredTools
    },
    aiSystemPromptExtension
  };
};

// ─── Guardado y Lectura en Firestore (users_metadata) ───────────────────────

export const saveUserTriageMetadata = async (userId, triageData) => {
  if (!userId) {
    console.warn('saveUserTriageMetadata: No hay userId, guardando solo localmente.');
    try {
      localStorage.setItem(STORAGE_KEY_LOCAL_TRIAGE, JSON.stringify(triageData));
    } catch (e) {
      console.error(e);
    }
    return triageData;
  }

  const cleanUserId = String(userId).trim();

  // Guardar en Firestore doc 'users_metadata/{cleanUserId}'
  try {
    const docRef = doc(db, TRIAGE_COLLECTION, cleanUserId);
    const payload = {
      ...triageData,
      userId: cleanUserId,
      updatedAt: serverTimestamp()
    };
    await setDoc(docRef, payload, { merge: true });
    console.log(`[TriageService] Guardado exitoso en ${TRIAGE_COLLECTION}/${cleanUserId}`);
  } catch (error) {
    console.error(`[TriageService] Error al guardar en Firestore (${TRIAGE_COLLECTION}):`, error);
  }

  // Guardar siempre copia local para fallback veloz y offline
  try {
    localStorage.setItem(`${STORAGE_KEY_LOCAL_TRIAGE}_${cleanUserId}`, JSON.stringify(triageData));
    localStorage.setItem(STORAGE_KEY_LOCAL_TRIAGE, JSON.stringify(triageData));
  } catch (e) {
    console.error('Error al guardar en cache local:', e);
  }

  return triageData;
};

export const getUserTriageMetadata = async (userId) => {
  // Intentar primero desde Firestore
  if (userId) {
    const cleanUserId = String(userId).trim();
    try {
      const docRef = doc(db, TRIAGE_COLLECTION, cleanUserId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        localStorage.setItem(`${STORAGE_KEY_LOCAL_TRIAGE}_${cleanUserId}`, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.warn(`[TriageService] Error al consultar ${TRIAGE_COLLECTION} en Firestore, usando fallback local:`, error);
    }

    // Fallback con ID específico en localStorage
    try {
      const cached = localStorage.getItem(`${STORAGE_KEY_LOCAL_TRIAGE}_${cleanUserId}`);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }
  }

  // Fallback genérico en localStorage
  try {
    const fallback = localStorage.getItem(STORAGE_KEY_LOCAL_TRIAGE);
    if (fallback) return JSON.parse(fallback);
  } catch (e) {
    console.error(e);
  }

  return null;
};
