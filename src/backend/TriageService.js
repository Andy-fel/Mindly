import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { DEFAULT_TEST_QUESTIONS } from './TestService';

// Re-exportar elementos del test para mantener compatibilidad si se requiere
export * from './TestService';

export const TRIAGE_COLLECTION = 'users_metadata';
export const STORAGE_KEY_LOCAL_TRIAGE = 'mindly_user_triage_cache';

// ─── Algoritmo de Triage Clínico, Matriz Pronóstica y RAG ───────────────────

export const calculateTriageAnalysis = (answers = {}, questions = DEFAULT_TEST_QUESTIONS) => {
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

  // Eje 1: Síntomas, desencadenantes y estado emocional
  const bringHereOpt = getAnswerObj('eje1_trae_aqui');
  const reasonOpt = getAnswerObj('eje1_motivo_principal') || getAnswerObj('eje2_q1');
  const moodOpt = getAnswerObj('eje1_estado_animo');
  const satisfactionOpt = getAnswerObj('eje1_satisfaccion_vida');
  const dailyDiffOpt = getAnswerObj('eje1_dificultad_diaria');
  const interestOpt = getAnswerObj('eje1_interes_cosas');
  const interfOpt = getAnswerObj('eje1_interferencia_emocional') || getAnswerObj('eje2_q2');

  // Nuevas 5 variables clínicas
  const sleepOpt = getAnswerObj('eje1_calidad_sueno');
  const somatizationOpt = getAnswerObj('eje1_tension_fisica');
  const selfCriticismOpt = getAnswerObj('eje1_autocritica');
  const focusOpt = getAnswerObj('eje1_concentracion');
  const energyOpt = getAnswerObj('eje1_energia_vital');

  const primaryReason = bringHereOpt?.value || reasonOpt?.value || 'Gestión emocional y estrés';
  const generalMood = moodOpt?.value || 'Con altibajos emocionales';
  const lifeSatisfaction = satisfactionOpt?.value || 'Moderadamente satisfecho/a';
  const dailyDifficulty = dailyDiffOpt?.value || interfOpt?.value || 'Dificultad leve a moderada';
  const lossOfInterest = interestOpt?.value || 'Mantiene intereses habituales';
  const emotionalInterference = interfOpt?.value || dailyDiffOpt?.value || 'A veces';

  const sleepQuality = sleepOpt?.value || 'Sueño regular';
  const physicalTension = somatizationOpt?.value || 'Tensión física ocasional';
  const selfCriticism = selfCriticismOpt?.value || 'Autocrítica moderada';
  const cognitiveFocus = focusOpt?.value || 'Claridad mental normal';
  const vitalEnergy = energyOpt?.value || 'Energía moderada';

  // Eje 2: Afrontamiento y redes
  const copingOpt = getAnswerObj('eje2_afrontamiento') || getAnswerObj('eje3_q1');
  const supportOpt = getAnswerObj('eje2_red_apoyo') || getAnswerObj('eje3_q2');
  const toolsOpt = getAnswerObj('eje2_herramientas') || getAnswerObj('eje3_q3');

  const copingMechanism = copingOpt?.value || 'Búsqueda de distracción';
  const supportNetwork = supportOpt?.value || 'Limitada';
  const preferredTools = toolsOpt?.value || 'Respiración y meditación guiada';

  // Eje 3: Pronóstico y Filtro Centinela
  const therapyHistoryOpt = getAnswerObj('eje3_psicologo_previo') || getAnswerObj('eje4_psicologo_previo');
  const therapyOpt = getAnswerObj('eje3_terapia_actual') || getAnswerObj('eje4_q1');
  const motivOpt = getAnswerObj('eje3_motivacion') || getAnswerObj('eje4_q2');
  const sentinelOpt = getAnswerObj('eje3_filtro_centinela') || getAnswerObj('eje4_q3');

  const priorTherapy = therapyHistoryOpt?.value || therapyOpt?.value || 'Sin experiencia previa en terapia';
  const motivation = motivOpt?.value || 'Moderadamente';
  const sentinelAnswer = sentinelOpt?.value || 'No, en absoluto';

  // Estilo de comunicación inferido adaptativamente de la psicometría clínica
  let communicationStyle = 'Empático y reflexivo';
  if (selfCriticismOpt?.trait === 'Autocrítico' || selfCriticismOpt?.trait === 'Severo') {
    communicationStyle = 'Empático, validador y autocompasivo (priorizar reducción de culpa y contención afectuosa)';
  } else if (copingOpt?.adaptive && motivOpt?.score === 3) {
    communicationStyle = 'Directo y práctico (orientado a soluciones paso a paso y herramientas conductuales)';
  } else if (preferredTools.includes('Reestructurar')) {
    communicationStyle = 'Educativo y cognitivo (explicando procesos mentales y reestructuración de pensamientos)';
  }

  const voiceTone = (generalMood.includes('Tenso') || somatizationOpt?.severity >= 3)
    ? 'Cálido y pausado (apoyo en regulación del sistema nervioso)'
    : 'Cálido y empático';

  // Detección de Banderas Rojas y Severidad
  const isSentinelTriggered = sentinelOpt?.isTrigger || sentinelOpt?.id === 'C' || (typeof sentinelAnswer === 'string' && sentinelAnswer.toLowerCase().includes('con frecuencia'));

  const interferenceSeverity = Math.max(
    interfOpt?.severity || 1,
    dailyDiffOpt?.severity || 1,
    somatizationOpt?.severity || 1
  );
  const hasAnhedonia = interestOpt?.hasAnhedonia || false;
  const isLifeCritical = satisfactionOpt?.level === 0;

  let riskLevel = 'Bajo';
  let riskBadgeColor = 'emerald';
  let clinicalRiskDescription = 'Paciente con bajo nivel de riesgo inmediato. Foco en psicoeducación, escucha activa y mindfulness preventivo.';

  if (isSentinelTriggered) {
    riskLevel = 'Alto Riesgo (Alerta Centinela)';
    riskBadgeColor = 'rose';
    clinicalRiskDescription = 'Bandera Centinela Activa: El paciente reporta pensamientos recurrentes de daño. Se requiere protocolo de seguridad activo y priorización de líneas de contención.';
  } else if (interferenceSeverity >= 3 || hasAnhedonia || isLifeCritical || supportOpt?.protection === 'Vulnerable' || sleepOpt?.score === 4) {
    riskLevel = 'Moderado';
    riskBadgeColor = 'amber';
    clinicalRiskDescription = 'Riesgo Moderado: Se identifican síntomas de tensión física/somatización, alteración del sueño, sobrecarga diaria o red de apoyo limitada. Se aconseja contención cercana y seguimiento.';
  }

  // Matriz de Indicadores Pronósticos (Introspección, Motivación, Red de Apoyo)
  // 1. Introspección
  let introspectionScore = 'Media';
  let introspectionDesc = 'Capacidad reflexiva funcional; reconoce motivos emocionales y patrones somáticos.';
  if (copingOpt?.adaptive || preferredTools.includes('Reestructurar') || selfCriticismOpt?.trait === 'Compasivo') {
    introspectionScore = 'Alta';
    introspectionDesc = 'Elevada apertura al insight, análisis de su estado anímico y curiosidad reflexiva.';
  } else if (copingOpt?.value?.includes('Aislarme') && interferenceSeverity >= 4) {
    introspectionScore = 'Baja a Moderada';
    introspectionDesc = 'Tiende al aislamiento y fatiga mental ante la sobrecarga; requiere guía guiada paso a paso.';
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
    `[Estilo de Comunicación Adaptativo]: ${communicationStyle}. Sé cálido, valida sus sentimientos sin juzgar y ofrece micro-pasos comprensivos.`,
    `[Tono de Voz AISE Sugerido]: ${voiceTone}.`,
    `[Motivo Principal de Consulta]: ${primaryReason}.`,
    `[Estado de Ánimo & Satisfacción]: Ánimo ${generalMood} | Satisfacción con la vida: ${lifeSatisfaction}.`,
    `[Somatización & Sueño]: Tensión corporal: ${physicalTension} | Calidad del sueño: ${sleepQuality}.`,
    `[Patrón Cognitivo & Energía]: Autocrítica: ${selfCriticism} | Concentración: ${cognitiveFocus} | Energía vital: ${vitalEnergy}.`,
    `[Dificultad Diaria & Anhedonia]: Dificultad: ${dailyDifficulty} | Pérdida de disfrute: ${lossOfInterest}.`,
    `[Mecanismo de Afrontamiento Habitual]: ${copingMechanism}.`,
    `[Red de Apoyo]: ${supportNetwork} (${supportProtection}).`,
    `[Herramientas Psicológicas Preferidas]: ${preferredTools}. Prioriza este tipo de técnicas en tus recomendaciones.`,
    `[Experiencia previa con psicólogo]: ${priorTherapy}.`,
    `[Indicadores Pronósticos]: Introspección ${introspectionScore} | Motivación ${motivationScore}.`,
    `[Alerta Centinela / Nivel de Riesgo]: ${riskLevel}. ${
      isSentinelTriggered
        ? 'ATENCIÓN CRÍTICA: Se detectó ideación de riesgo en el test. Mantén un tono sumamente empático, NO minimices el dolor, y ante cualquier indicio de crisis ofrece pausar y acudir al Panel de Emergencias SOS o línea 106.'
        : 'Mantén el protocolo habitual de contención empática y mindfulness.'
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
      generalMood,
      lifeSatisfaction,
      dailyDifficulty,
      lossOfInterest,
      sleepQuality,
      physicalTension,
      selfCriticism,
      cognitiveFocus,
      vitalEnergy,
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

  // Guardar siempre copia local para fallback veloz y offline (solo por userId)
  try {
    localStorage.setItem(`${STORAGE_KEY_LOCAL_TRIAGE}_${cleanUserId}`, JSON.stringify(triageData));
  } catch (e) {
    console.error('Error al guardar en cache local:', e);
  }

  return triageData;
};

export const getUserTriageMetadata = async (userId) => {
  // Intentar primero desde Firestore
  if (userId) {
    const cleanUserId = String(userId).trim();    try {
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

  // Sin userId no se puede recuperar datos específicos
  return null;
};
