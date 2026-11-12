import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { saveSession } from './SessionService';
import { getUserSettings } from './SettingsService';
import { getUserTriageMetadata } from './TriageService';
import { auth, db } from '../firebaseConfig';

// Valores predeterminados de contingencia para OpenRouter
const DEFAULT_OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';


// Cache en memoria para la configuración completa de OpenRouter
let cachedConfig = {
    apiKey: null,
    model: null,
    apiUrl: null,
};

export const getOpenRouterConfig = async () => {
    // Si ya están en caché los 3 valores, retornarlos directamente
    if (cachedConfig.apiKey && cachedConfig.model && cachedConfig.apiUrl) {
        return cachedConfig;
    }

    // 1. Obtener desde Firestore en App_configuration -> Configurations
    try {
        const configDocRef = doc(db, 'App_configuration', 'Configurations');
        const configSnap = await getDoc(configDocRef);
        if (configSnap.exists()) {
            const data = configSnap.data();

            // API Key
            const keyFromDb = data?.OpenRouter_Api_Key || data?.OPENROUTER_API_KEY || data?.openrouter_api_key;
            if (keyFromDb && typeof keyFromDb === 'string') {
                const cleanedKey = keyFromDb.trim().replace(/^['"]|['"]$/g, '');
                if (cleanedKey) cachedConfig.apiKey = cleanedKey;
            }

            // Modelo (soporta OPENROUTER_MODEL, OpenRouter_Model, etc.)
            const modelFromDb = data?.OPENROUTER_MODEL || data?.OpenRouter_Model || data?.OpenRouter_MODEL || data?.openrouter_model;
            if (modelFromDb && typeof modelFromDb === 'string') {
                const cleanedModel = modelFromDb.trim().replace(/^['"]|['"]$/g, '');
                if (cleanedModel) cachedConfig.model = cleanedModel;
            }

            // API URL (soporta OPENROUTER_API_URL, OpenRouter_Api_Url, etc.)
            const urlFromDb = data?.OPENROUTER_API_URL || data?.OpenRouter_Api_Url || data?.OpenRouter_Api_URL || data?.openrouter_api_url;
            if (urlFromDb && typeof urlFromDb === 'string') {
                const cleanedUrl = urlFromDb.trim().replace(/^['"]|['"]$/g, '');
                if (cleanedUrl) cachedConfig.apiUrl = cleanedUrl;
            }

            console.log("[VoiceLogic] Configuración de OpenRouter obtenida desde Firestore (App_configuration/Configurations):", {
                hasKey: !!cachedConfig.apiKey,
                model: cachedConfig.model || 'usando fallback',
                apiUrl: cachedConfig.apiUrl || 'usando fallback'
            });
        }
    } catch (e) {
        console.warn('[VoiceLogic] Error al leer configuración de OpenRouter desde Firestore:', e);
    }

    // 2. Fallbacks de respaldo con .env o valores predeterminados
    if (!cachedConfig.apiKey) {
        const envKey = (import.meta.env.VITE_OPENROUTER_KEY || '').trim().replace(/^['"]|['"]$/g, '');
        if (envKey) cachedConfig.apiKey = envKey;
    }

    if (!cachedConfig.model) {
        const envModel = (import.meta.env.VITE_OPENROUTER_MODEL || '').trim().replace(/^['"]|['"]$/g, '');
        cachedConfig.model = envModel || DEFAULT_OPENROUTER_MODEL;
    }

    if (!cachedConfig.apiUrl) {
        const envUrl = (import.meta.env.VITE_OPENROUTER_API_URL || '').trim().replace(/^['"]|['"]$/g, '');
        cachedConfig.apiUrl = envUrl || DEFAULT_OPENROUTER_URL;
    }

    return cachedConfig;
};

// Mantener compatibilidad exportando también getOpenRouterApiKey
export const getOpenRouterApiKey = async () => {
    const config = await getOpenRouterConfig();
    return config.apiKey;
};

const SYSTEM_INSTRUCTION =
    'Eres A.I.S.E., tu nombre significa Asistente Inteligente de Soporte Emocional. ' +
    'Eres una IA de asistencia psicológica, calma mental y mindfulness de la app Mindly. ' +
    'Eres empática, calmada y paciente. Das respuestas cortas, reflexivas y útiles (máximo 2-3 oraciones breves). ' +
    'Tu idioma principal es el español.';

const EMERGENCY_KEYWORDS = ['suicidar', 'suicidio', 'matar', 'quitarme la vida', 'no quiero vivir', 'morir'];

const MOOD_CONFIGS = {
    Tranquilo: { bg: 'bg-secondary/10', text: 'text-secondary', iconColor: 'bg-secondary/20 text-secondary' },
    Ansioso: { bg: 'bg-red-100', text: 'text-red-700', iconColor: 'bg-red-200 text-red-700' },
    Feliz: { bg: 'bg-yellow-100', text: 'text-yellow-700', iconColor: 'bg-yellow-200 text-yellow-700' },
    Introspectivo: { bg: 'bg-primary/10', text: 'text-primary', iconColor: 'bg-primary/20 text-primary' },
    Agradecido: { bg: 'bg-green-100', text: 'text-green-700', iconColor: 'bg-green-200 text-green-700' },
    Desahogo: { bg: 'bg-purple-100', text: 'text-purple-700', iconColor: 'bg-purple-200 text-purple-700' },
    Neutral: { bg: 'bg-gray-100', text: 'text-gray-600', iconColor: 'bg-gray-200 text-gray-600' }
};

// Función auxiliar unificada para invocar OpenRouter con Llama 3
const callLlama = async (messages, temperature = 0.5) => {
    const config = await getOpenRouterConfig();
    if (!config.apiKey) {
        throw new Error('No se encontró la API Key de OpenRouter en Firebase (App_configuration -> Configurations -> OpenRouter_Api_Key) ni en el entorno.');
    }

    const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            // 'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://mindly.app',
            // 'X-Title': 'Mindly AISE'
        },
        body: JSON.stringify({
            model: config.model,
            temperature,
            messages
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
};

export const useVoiceLogic = () => {
    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isTextMode, setIsTextMode] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hola, soy A.I.S.E., tu Asistente Inteligente de Soporte Emocional. Estoy aquí para escucharte.' }
    ]);
    const [isListening, setIsListening] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [transcriptionOpacity, setTranscriptionOpacity] = useState(0.6);
    const [isProcessingSummary, setIsProcessingSummary] = useState(false);
    const [triageProfile, setTriageProfile] = useState(null);

    // Cargar expediente clínico RAG desde users_metadata
    useEffect(() => {
        const loadTriage = async () => {
            const user = auth.currentUser;
            const profile = await getUserTriageMetadata(user ? (user.email || user.uid) : null);
            if (profile) {
                setTriageProfile(profile);
            }
        };
        loadTriage();
    }, []);

    // Refs
    const orbRef = useRef(null);
    const glowRef = useRef(null);
    const recognitionRef = useRef(null);
    const inactivityTimeoutRef = useRef(null);
    const sessionStartTimeRef = useRef(Date.now());
    const messagesRef = useRef(messages);

    // Sincronizar messagesRef para evitar dependencias circulares o closures obsoletos
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const toggleMode = () => setIsTextMode(prev => !prev);

    // Text-to-Speech (TTS)
    const speakResponse = useCallback((text) => {
        if (!('speechSynthesis' in window)) return;

        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
        }

        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';

            let rate = 1.0;
            let pitch = 1.1;
            const preferredTone = triageProfile?.personalityTraits?.voiceTone;
            if (preferredTone?.includes('Cálido') || preferredTone?.includes('pausado')) {
                rate = 0.92;
                pitch = 1.05;
            } else if (preferredTone?.includes('Dinámico') || preferredTone?.includes('motivador')) {
                rate = 1.08;
                pitch = 1.15;
            } else if (preferredTone?.includes('Neutral')) {
                rate = 1.0;
                pitch = 1.0;
            }

            utterance.rate = rate;
            utterance.pitch = pitch;

            const voices = window.speechSynthesis.getVoices();
            const esVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Online') || v.name.includes('Natural') || v.name.includes('Siri')))
                || voices.find(v => v.lang.startsWith('es') && (v.name.includes('Microsoft') || v.name.includes('Mónica') || v.name.includes('Paulina') || v.name.includes('Diego')))
                || voices.find(v => v.lang.startsWith('es'));

            if (esVoice) utterance.voice = esVoice;
            window.speechSynthesis.speak(utterance);
        }, 50);
    }, []);

    // Desbloqueo de audio TTS para navegadores móviles (iOS)
    const initTTS = useCallback(() => {
        if ('speechSynthesis' in window) {
            const silent = new SpeechSynthesisUtterance(' ');
            silent.volume = 0.01;
            silent.rate = 10;
            window.speechSynthesis.speak(silent);
        }
    }, []);

    // Carga de voces del sintetizador
    useEffect(() => {
        if ('speechSynthesis' in window) {
            const handleVoicesChanged = () => window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
            return () => {
                window.speechSynthesis.onvoiceschanged = null;
            };
        }
    }, []);

    // Inicialización del Reconocimiento de Voz y Parallax
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'es-ES';

            recognition.onresult = (event) => {
                let interim = '';
                let final = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) final += event.results[i][0].transcript;
                    else interim += event.results[i][0].transcript;
                }
                setCurrentTranscript(final || interim);
                setTranscriptionOpacity(1);
            };

            recognition.onend = () => setIsListening(false);

            recognition.onerror = (event) => {
                console.error('Error en reconocimiento de voz:', event.error);
                setIsListening(false);
                if (event.error === 'network') {
                    setCurrentTranscript('Error de red: El navegador no pudo conectar con el servicio de voz.');
                    setMessages(prev => [...prev, {
                        role: 'model',
                        text: 'Tuve un problema al escuchar por red. ¿Podrías intentar escribiendo?'
                    }]);
                } else if (event.error === 'not-allowed') {
                    setCurrentTranscript('Error: Permiso de micrófono denegado.');
                } else {
                    setCurrentTranscript(`Error al escuchar: ${event.error}`);
                }
            };

            recognitionRef.current = recognition;
        }

        // Efecto Parallax en el Orbe
        const handleMouseMove = (e) => {
            if (!orbRef.current || !glowRef.current) return;
            const x = (window.innerWidth / 2 - e.pageX) / 100;
            const y = (window.innerHeight / 2 - e.pageY) / 100;
            orbRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            glowRef.current.style.transform = `scale(1.05) translate3d(${x * 1.5}px, ${y * 1.5}px, 0)`;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            recognitionRef.current?.abort();
        };
    }, []);

    // Inactividad y cierre automático tras 60s
    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = setTimeout(() => {
            if (messagesRef.current.length > 1) {
                endSession();
            }
        }, 60000);
    }, []);

    useEffect(() => {
        resetInactivityTimer();
        return () => {
            if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
        };
    }, [resetInactivityTimer]);

    // Protocolo de atención de emergencias
    const handleEmergencyProtocol = async () => {
        const breathingResponse = 'Detecto que estás pasando por un momento muy difícil. Antes de todo, respira conmigo. Inhala profundamente... mantén el aire... y exhala lentamente.';
        setMessages(prev => [...prev, { role: 'model', text: breathingResponse }]);
        speakResponse(breathingResponse);

        setTimeout(() => {
            const breathingRepeat = 'Muy bien. Una vez más: Inhala... mantén... exhala despacio. Tu seguridad es lo más importante. Voy a contactar ayuda de inmediato.';
            setMessages(prev => [...prev, { role: 'model', text: breathingRepeat }]);
            speakResponse(breathingRepeat);
        }, 8000);

        let emergencyNumber = '106';
        const user = auth.currentUser;
        if (user) {
            try {
                const settings = await getUserSettings(user.email || user.uid);
                if (settings?.emergencyLine) emergencyNumber = settings.emergencyLine;
            } catch (e) {
                console.error('Error al obtener número de emergencia:', e);
            }
        }

        setTimeout(() => {
            window.location.href = `tel:${emergencyNumber}`;
        }, 16000);
    };

    // Envío y procesamiento de mensajes exclusivamente con Llama 3 en OpenRouter
    const sendMessage = async (text) => {
        if (!text || !text.trim()) return;

        resetInactivityTimer();
        const userText = text.trim();
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setCurrentTranscript('');

        // Verificación de palabras clave de emergencia
        const isEmergency = EMERGENCY_KEYWORDS.some(k => userText.toLowerCase().includes(k));
        if (isEmergency) {
            await handleEmergencyProtocol();
            return;
        }

        try {
            let activeSystemInstruction = SYSTEM_INSTRUCTION;
            if (triageProfile?.aiSystemPromptExtension) {
                activeSystemInstruction += '\n\n' + triageProfile.aiSystemPromptExtension;
            }

            const promptHistory = [
                { role: 'system', content: activeSystemInstruction },
                ...messagesRef.current.map(m => ({
                    role: m.role === 'model' ? 'assistant' : 'user',
                    content: m.text
                })),
                { role: 'user', content: userText }
            ];

            const responseText = await callLlama(promptHistory, 0.6);
            const finalText = responseText || 'Estoy aquí contigo. Tómate tu tiempo para respirar y contarme cómo te sientes.';

            setMessages(prev => [...prev, { role: 'model', text: finalText }]);
            speakResponse(finalText);
        } catch (error) {
            console.error('Error al comunicarse con Llama 3 en OpenRouter:', error);
            const errorMsg = 'Lo siento, tuve un problema de conexión al procesar tu mensaje. ¿Podrías repetirlo?';
            setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
            speakResponse(errorMsg);
        }
    };

    // Control de escucha del micrófono
    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            initTTS();
            setCurrentTranscript('Escuchando...');
            setTranscriptionOpacity(0.6);
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (err) {
                console.warn('Reconocimiento ya activo o no disponible:', err);
            }
        }
        resetInactivityTimer();
    };

    // Auto-envío cuando el usuario termina de hablar
    useEffect(() => {
        if (!isListening && currentTranscript && currentTranscript !== 'Escuchando...') {
            sendMessage(currentTranscript);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isListening]);

    // Resumen y guardado de sesión con Llama 3
    const endSession = async () => {
        if (isProcessingSummary) return;
        setIsProcessingSummary(true);

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }

        try {
            const currentHistory = messagesRef.current;
            const chatHistoryText = currentHistory
                .map(m => `${m.role === 'user' ? 'Usuario' : 'AISE'}: ${m.text}`)
                .join('\n');

            const summaryPrompt = [
                {
                    role: 'system',
                    content: 'Eres un analista psicológico experto. Responde ÚNICAMENTE un JSON válido con las claves "summary" y "emotion". Sin texto adicional ni formato markdown.'
                },
                {
                    role: 'user',
                    content: `Analiza la transcripción de esta sesión de apoyo psicológico.\n` +
                        `Proporciona un resumen breve (2-3 líneas) y la emoción principal sentida por el usuario.\n` +
                        `Opciones exactas de emoción: "Tranquilo", "Ansioso", "Feliz", "Introspectivo", "Agradecido", "Desahogo", "Neutral".\n` +
                        `Estructura requerida: {"summary": "...", "emotion": "..."}\n\n` +
                        `Transcripción:\n${chatHistoryText}`
                }
            ];

            let rawResponse = '';
            try {
                rawResponse = await callLlama(summaryPrompt, 0.2);
            } catch (err) {
                console.error('Error al generar resumen con Llama 3:', err);
            }

            let summaryData = { summary: 'Sesión completada.', emotion: 'Neutral' };
            try {
                const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    summaryData = JSON.parse(jsonMatch[0]);
                }
            } catch (e) {
                console.warn('No se pudo parsear el JSON del resumen, usando valores por defecto:', e);
            }

            const durationMs = Date.now() - sessionStartTimeRef.current;
            const minutes = Math.max(1, Math.round(durationMs / 60000));
            const mood = MOOD_CONFIGS[summaryData.emotion] || MOOD_CONFIGS.Neutral;

            const sessionData = {
                title: `Sesión de ${summaryData.emotion}`,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                minutes,
                moods: [{ label: summaryData.emotion, bg: mood.bg, text: mood.text }],
                iconColor: mood.iconColor,
                summary: summaryData.summary
            };

            const user = auth.currentUser;
            if (user) {
                await saveSession(user.email || user.uid, sessionData);
            }

            setMessages(prev => [...prev, {
                role: 'model',
                text: 'Sesión guardada exitosamente. Puedes revisar el resumen en Memory Lane.'
            }]);
        } catch (error) {
            console.error('Error al terminar sesión:', error);
            setMessages(prev => [...prev, {
                role: 'model',
                text: 'Error al intentar guardar el resumen de la sesión.'
            }]);
        } finally {
            setIsProcessingSummary(false);
            sessionStartTimeRef.current = Date.now();
        }
    };

    return {
        isSidebarOpen,
        toggleSidebar,
        isTextMode,
        toggleMode,
        messages,
        sendMessage,
        isListening,
        toggleListening,
        currentTranscript,
        transcriptionOpacity,
        orbRef,
        glowRef,
        endSession,
        isProcessingSummary,
        sessionStartTimeRef,
        initTTS
    };
};