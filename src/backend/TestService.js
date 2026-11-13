export const STORAGE_KEY_QUESTIONS = 'mindly_triage_custom_questions_v3';

// Preguntas base de los 3 ejes clínicos (Eje 1 anterior removido)
export const DEFAULT_TEST_QUESTIONS = [
  // ─── Eje 1: Síntomas y Estado Emocional ─────────────────────────────────────
  {
    id: 'eje1_trae_aqui',
    axisId: 1,
    axisTitle: 'Eje 1: Síntomas y Estado Emocional',
    axisDescription: 'Identificación de motivos de consulta, estado anímico y factores de tensión inmediata.',
    question: '¿Qué te trae por aquí?',
    category: 'primaryReason',
    options: [
      { id: 'A', text: 'Necesito desahogarme de una situación difícil o estrés acumulado.', value: 'Desahogo y estrés acumulado', tag: 'Desahogo' },
      { id: 'B', text: 'Busco herramientas para calmar mi ansiedad o pensamientos abrumadores.', value: 'Manejo de ansiedad y sobrepensamiento', tag: 'Ansiedad' },
      { id: 'C', text: 'Siento desánimo, tristeza o falta de rumbo personal.', value: 'Desánimo y tristeza prolongada', tag: 'Ánimo' },
      { id: 'D', text: 'Quiero mejorar mis hábitos emocionales, relaciones y bienestar general.', value: 'Desarrollo emocional y bienestar', tag: 'Bienestar' }
    ]
  },
  {
    id: 'eje1_motivo_principal',
    axisId: 1,
    axisTitle: 'Eje 1: Síntomas y Estado Emocional',
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
    id: 'eje1_estado_animo',
    axisId: 1,
    axisTitle: 'Eje 1: Síntomas y Estado Emocional',
    axisDescription: 'Exploración de la valencia y estabilidad afectiva.',
    question: 'En general, ¿cómo describirías tu estado de ánimo?',
    category: 'generalMood',
    options: [
      { id: 'A', text: 'Mayormente estable, positivo o tranquilo.', value: 'Estable y tranquilo', valence: 'Positivo' },
      { id: 'B', text: 'Con altibajos marcados o cambios repentinos.', value: 'Inestable con altibajos', valence: 'Variable' },
      { id: 'C', text: 'Tenso, irritable o angustiado/a gran parte del tiempo.', value: 'Tenso y angustiado', valence: 'Ansioso' },
      { id: 'D', text: 'Apagado, triste o con desgano constante.', value: 'Apagado y desanimado', valence: 'Bajo' }
    ]
  },
  {
    id: 'eje1_satisfaccion_vida',
    axisId: 1,
    axisTitle: 'Eje 1: Síntomas y Estado Emocional',
    axisDescription: 'Evaluación de bienestar subjetivo y satisfacción vital global.',
    question: 'En una escala de 0-10, ¿qué tan contento estás con tu vida?',
    category: 'lifeSatisfaction',
    options: [
      { id: 'A', text: '8 - 10: Muy satisfecho/a y en general agradecido/a con mi momento actual.', value: '8-10 (Alta satisfacción)', level: 3 },
      { id: 'B', text: '5 - 7: Moderadamente satisfecho/a, con áreas por mejorar o resolver.', value: '5-7 (Satisfacción media)', level: 2 },
      { id: 'C', text: '3 - 4: Con insatisfacción notable y dificultades frecuentes.', value: '3-4 (Baja satisfacción)', level: 1 },
      { id: 'D', text: '0 - 2: Muy descontento/a o atravesando una etapa de profundo malestar.', value: '0-2 (Insatisfacción crítica)', level: 0 }
    ]
  },
  {
    id: 'eje1_dificultad_diaria',
    axisId: 1,
    axisTitle: 'Eje 1: Síntomas y Estado Emocional',
    axisDescription: 'Impacto funcional en las actividades cotidianas.',
    question: '¿Le ha resultado difícil la vida diaria últimamente?',
    category: 'dailyDifficulty',
    options: [
      { id: 'A', text: 'No, cumplo con mis actividades y responsabilidades con normalidad.', value: 'Sin dificultad significativa', severity: 1 },
      { id: 'B', text: 'Un poco, algunas tareas me cuestan más energía o concentración que antes.', value: 'Dificultad leve a moderada', severity: 2 },
      { id: 'C', text: 'Bastante, me cuesta mucho enfocarme, levantarme o continuar mi rutina.', value: 'Dificultad alta', severity: 3 },
      { id: 'D', text: 'Mucho, siento que el día a día me paraliza o me sobrepasa totalmente.', value: 'Sobrecarga diaria severa', severity: 4 }
    ]
  },
  {
    id: 'eje1_interes_cosas',
    axisId: 1,
    axisTitle: 'Eje 1: Síntomas y Estado Emocional',
    axisDescription: 'Detección de anhedonia y pérdida de capacidad de disfrute.',
    question: '¿He perdido últimamente el interés por las cosas que me gustaban?',
    category: 'lossOfInterest',
    options: [
      { id: 'A', text: 'No, sigo disfrutando de mis actividades, hobbies y pasatiempos.', value: 'Mantiene interés y disfrute', hasAnhedonia: false },
      { id: 'B', text: 'A veces me cuesta iniciar o encontrar entusiasmo, pero aún lo disfruto.', value: 'Desinterés ocasional', hasAnhedonia: false },
      { id: 'C', text: 'Sí, he perdido el gusto por varias actividades que antes me llenaban.', value: 'Pérdida moderada de interés', hasAnhedonia: true },
      { id: 'D', text: 'Casi por completo, nada parece motivarme ni causarme placer o alegría.', value: 'Anhedonia severa', hasAnhedonia: true }
    ]
  },
  {
    id: 'eje1_interferencia_emocional',
    axisId: 1,
    axisTitle: 'Eje 1: Síntomas y Estado Emocional',
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
  // ── 5 NUEVAS PREGUNTAS CLÍNICAS AÑADIDAS AL EJE 1 ──
  {
    id: 'eje1_calidad_sueno',
    axisId: 1,
    axisTitle: 'Eje 1: Síntomas y Estado Emocional',
    axisDescription: 'Patrón de descanso nocturno y calidad del sueño.',
    question: '¿Cómo ha sido la calidad de tu sueño en las últimas semanas?',
    category: 'sleepQuality',
    options: [
      { id: 'A', text: 'Duermo bien y me despierto con energía y descanso.', value: 'Sueño reparador', score: 1 },
      { id: 'B', text: 'Me cuesta conciliar el sueño por sobrepensar o tensión mental.', value: 'Dificultad de conciliación', score: 2 },
      { id: 'C', text: 'Me despierto varias veces durante la noche o demasiado temprano.', value: 'Despertares nocturnos frecuentes', score: 3 },
      { id: 'D', text: 'Insomnio severo o duermo en exceso para evadir el día.', value: 'Patrón de sueño severamente alterado', score: 4 }
    ]
  },
  {
    id: 'eje1_tension_fisica',
    axisId: 1,
    axisTitle: 'Eje 1: Síntomas y Estado Emocional',
    axisDescription: 'Manifestaciones somáticas y tensión corporal.',
    question: '¿Experimentas tensión física o somatizaciones frecuentes (dolor de cabeza, nudos musculares o presión en el pecho)?',
    category: 'somatization',
    options: [
      { id: 'A', text: 'Rara vez o nunca.', value: 'Sin somatización notable', severity: 1 },
      { id: 'B', text: 'Ocasionalmente, ante situaciones de estrés puntual.', value: 'Tensión somática ocasional', severity: 2 },
      { id: 'C', text: 'Con frecuencia varias veces por semana.', value: 'Somatización frecuente', severity: 3 },
      { id: 'D', text: 'Casi a diario, mi cuerpo acumula un malestar físico constante.', value: 'Somatización severa / crónica', severity: 4 }
    ]
  },
  {
    id: 'eje1_autocritica',
    axisId: 1,
    axisTitle: 'Eje 1: Síntomas y Estado Emocional',
    axisDescription: 'Patrones cognitivos de autoexigencia y autojuicio.',
    question: '¿Con qué frecuencia te juzgas duramente o sientes que no eres lo suficientemente bueno/a?',
    category: 'selfCriticism',
    options: [
      { id: 'A', text: 'Rara vez, suelo ser comprensivo/a y compasivo/a conmigo mismo/a.', value: 'Baja autocrítica / Autocompasión', trait: 'Compasivo' },
      { id: 'B', text: 'A veces, especialmente cuando cometo errores o me equivoco.', value: 'Autocrítica moderada', trait: 'Moderado' },
      { id: 'C', text: 'Frecuentemente, tiendo a ser muy autocrítico/a y exigente.', value: 'Alta autoexigencia y juicio', trait: 'Autocrítico' },
      { id: 'D', text: 'Casi todo el tiempo, me acompaña una sensación persistente de culpa o insuficiencia.', value: 'Culpa e insuficiencia persistente', trait: 'Severo' }
    ]
  },
  {
    id: 'eje1_concentracion',
    axisId: 1,
    axisTitle: 'Eje 1: Síntomas y Estado Emocional',
    axisDescription: 'Claridad mental y capacidad de toma de decisiones.',
    question: '¿Has notado dificultades para concentrarte en tus tareas o tomar decisiones cotidianas?',
    category: 'cognitiveFocus',
    options: [
      { id: 'A', text: 'No, mantengo buena claridad mental y enfoque habitual.', value: 'Claridad mental conservada', level: 1 },
      { id: 'B', text: 'Un poco de dispersión mental en días con mayor carga.', value: 'Dispersión mental leve', level: 2 },
      { id: 'C', text: 'Me cuesta bastante concentrarme y tiendo a postergar por sobrecarga.', value: 'Dificultad de concentración marcada', level: 3 },
      { id: 'D', text: 'Me siento en una niebla mental constante, cualquier decisión me abruma.', value: 'Niebla mental y bloqueo decisional', level: 4 }
    ]
  },
  {
    id: 'eje1_energia_vital',
    axisId: 1,
    axisTitle: 'Eje 1: Síntomas y Estado Emocional',
    axisDescription: 'Niveles de vitalidad y fatiga diurna.',
    question: '¿Cómo describirías tus niveles de energía a lo largo del día?',
    category: 'vitalEnergy',
    options: [
      { id: 'A', text: 'Buenos y constantes, me rinde el día adecuadamente.', value: 'Energía óptima', vitality: 'Alta' },
      { id: 'B', text: 'Bajan notablemente hacia la tarde, pero logro recuperarme.', value: 'Energía normal con fluctuaciones', vitality: 'Media' },
      { id: 'C', text: 'Bajos, a menudo siento cansancio incluso después de haber dormido.', value: 'Fatiga recurrente', vitality: 'Baja' },
      { id: 'D', text: 'Agotamiento profundo o fatiga persistente casi todo el tiempo.', value: 'Agotamiento vital profundo', vitality: 'Crítica' }
    ]
  },

  // ─── Eje 2: Recursos Personales y Afrontamiento ────────────────────────────
  {
    id: 'eje2_afrontamiento',
    axisId: 2,
    axisTitle: 'Eje 2: Recursos Personales y Afrontamiento',
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
    id: 'eje2_red_apoyo',
    axisId: 2,
    axisTitle: 'Eje 2: Recursos Personales y Afrontamiento',
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
    id: 'eje2_herramientas',
    axisId: 2,
    axisTitle: 'Eje 2: Recursos Personales y Afrontamiento',
    axisDescription: 'Preferencia de intervenciones psicológicas y técnicas de regulación.',
    question: '¿Qué tipo de ejercicios o herramientas te resultan más útiles?',
    category: 'preferredTools',
    options: [
      { id: 'A', text: 'Respiración y meditación guiada.', value: 'Respiración y meditación guiada', technique: 'Mindfulness y Somático' },
      { id: 'B', text: 'Reestructurar o escribir mis pensamientos.', value: 'Reestructurar o escribir mis pensamientos', technique: 'CBT y Reestructuración Cognitiva' },
      { id: 'C', text: 'Tareas o metas pequeñas para el día a día.', value: 'Tareas o metas pequeñas para el día a día', technique: 'Activación Conductual' }
    ]
  },

  // ─── Eje 3: Indicadores Pronósticos y Banderas Rojas (Filtro de Seguridad) ──
  {
    id: 'eje3_psicologo_previo',
    axisId: 3,
    axisTitle: 'Eje 3: Indicadores Pronósticos y Banderas Rojas (Filtro de Seguridad)',
    axisDescription: 'Historial y apertura hacia la atención psicológica profesional.',
    question: '¿Alguna vez has visto un psicólogo?',
    category: 'priorTherapyHistory',
    options: [
      { id: 'A', text: 'Sí, asisto a terapia psicológica actualmente.', value: 'En tratamiento activo', status: 'En tratamiento activo' },
      { id: 'B', text: 'Sí, fui a terapia psicológica en el pasado.', value: 'Experiencia previa con terapia', status: 'Experiencia previa' },
      { id: 'C', text: 'No, nunca he ido a un psicólogo.', value: 'Sin experiencia previa en terapia', status: 'Primer contacto terapéutico' },
      { id: 'D', text: 'Lo he considerado últimamente pero aún no he iniciado.', value: 'Contemplando iniciar terapia', status: 'Fase de contemplación' }
    ]
  },
  {
    id: 'eje3_terapia_actual',
    axisId: 3,
    axisTitle: 'Eje 3: Indicadores Pronósticos y Banderas Rojas (Filtro de Seguridad)',
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
    id: 'eje3_motivacion',
    axisId: 3,
    axisTitle: 'Eje 3: Indicadores Pronósticos y Banderas Rojas (Filtro de Seguridad)',
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
    id: 'eje3_filtro_centinela',
    axisId: 3,
    axisTitle: 'Eje 3: Indicadores Pronósticos y Banderas Rojas (Filtro de Seguridad)',
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

// Alias para retrocompatibilidad
export const DEFAULT_TRIAGE_QUESTIONS = DEFAULT_TEST_QUESTIONS;

// ─── Gestión de Preguntas Dinámicas del Test (CRUD en LocalStorage) ───────────

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
  return DEFAULT_TEST_QUESTIONS;
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
    return DEFAULT_TEST_QUESTIONS;
  } catch (e) {
    console.error('Error al reiniciar preguntas:', e);
    return DEFAULT_TEST_QUESTIONS;
  }
};
