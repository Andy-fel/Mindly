/**
 * MemoryLane.jsx — Mindly
 *
 * Conversión 1:1 del HTML original a React + Tailwind CSS.
 * Lógica expandida:
 *   - Gráfico interactivo con tooltip y selección de barra
 *   - Filtros de mood (All / Calm / Anxious / Joyful / Introspective)
 *   - Búsqueda en tiempo real por título
 *   - Paginación con "Cargar más" (lazy)
 *   - Skeleton loader al cargar más
 *   - Stats calculados dinámicamente desde los datos
 *   - Modal de detalle de sesión
 *   - Sidebar drawer (mismo patrón que EmergencyMode)
 *
 * Props (todos opcionales con defaults):
 *   sessions      – array de sesiones (ver SESSION_DATA para el shape)
 *   userName      – string
 *   onNavigate    – (route: string) => void
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { getUserSessions } from '../../backend/SessionService';
import "./memory_Line_style.css";


// ─── Data por defecto ─────────────────────────────────────────────────────────

const ALL_SESSIONS = [
    {
        id: 1,
        title: "Midnight Reflection",
        date: "Oct 24, 2024",
        minutes: 14,
        moods: [
            { label: "Introspective", bg: "bg-primary/10", text: "text-primary" },
            { label: "Calm", bg: "bg-secondary/10", text: "text-secondary" },
        ],
        iconColor: "bg-secondary/20 text-secondary",
        summary: "Exploración profunda de pensamientos nocturnos. Sensación general de paz y reflexión sobre metas personales.",
    },
    {
        id: 2,
        title: "Morning Intentions",
        date: "Oct 23, 2024",
        minutes: 8,
        moods: [
            { label: "Grateful", bg: "bg-green-100", text: "text-green-700" },
            { label: "Joyful", bg: "bg-yellow-100", text: "text-yellow-700" },
        ],
        iconColor: "bg-primary/20 text-primary",
        summary: "Establecimiento de intenciones para la semana. Gratitud por avances recientes y energía positiva.",
    },
    {
        id: 3,
        title: "Work Anxiety Release",
        date: "Oct 22, 2024",
        minutes: 22,
        moods: [
            { label: "Anxious", bg: "bg-red-100", text: "text-red-700" },
            { label: "Venting", bg: "bg-purple-100", text: "text-purple-700" },
        ],
        iconColor: "bg-neutral/10 text-neutral",
        summary: "Descarga emocional sobre presiones laborales. Se identificaron detonantes principales y estrategias de alivio.",
    },
    {
        id: 4,
        title: "Evening Wind-Down",
        date: "Oct 21, 2024",
        minutes: 11,
        moods: [
            { label: "Calm", bg: "bg-secondary/10", text: "text-secondary" },
            { label: "Introspective", bg: "bg-primary/10", text: "text-primary" },
        ],
        iconColor: "bg-secondary/20 text-secondary",
        summary: "Ritual de cierre del día. Repaso de logros y preparación mental para el descanso.",
    },
    {
        id: 5,
        title: "Weekend Clarity",
        date: "Oct 20, 2024",
        minutes: 18,
        moods: [
            { label: "Joyful", bg: "bg-yellow-100", text: "text-yellow-700" },
            { label: "Grateful", bg: "bg-green-100", text: "text-green-700" },
        ],
        iconColor: "bg-primary/20 text-primary",
        summary: "Momento de claridad sobre prioridades personales. Conexión renovada con valores fundamentales.",
    },
    {
        id: 6,
        title: "Post-Argument Processing",
        date: "Oct 19, 2024",
        minutes: 25,
        moods: [
            { label: "Anxious", bg: "bg-red-100", text: "text-red-700" },
            { label: "Calm", bg: "bg-secondary/10", text: "text-secondary" },
        ],
        iconColor: "bg-neutral/10 text-neutral",
        summary: "Procesamiento de conflicto interpersonal. Transición gradual de tensión a comprensión y calma.",
    },
    {
        id: 7,
        title: "Gratitude Overflow",
        date: "Oct 18, 2024",
        minutes: 9,
        moods: [
            { label: "Grateful", bg: "bg-green-100", text: "text-green-700" },
            { label: "Introspective", bg: "bg-primary/10", text: "text-primary" },
        ],
        iconColor: "bg-primary/20 text-primary",
        summary: "Lista de gratitudes extendida. Reconocimiento de pequeñas victorias y conexiones significativas.",
    },
    {
        id: 8,
        title: "Thursday Deep Dive",
        date: "Oct 17, 2024",
        minutes: 31,
        moods: [
            { label: "Introspective", bg: "bg-primary/10", text: "text-primary" },
            { label: "Venting", bg: "bg-purple-100", text: "text-purple-700" },
        ],
        iconColor: "bg-secondary/20 text-secondary",
        summary: "Sesión intensa de auto-análisis. Patrones de comportamiento identificados y plan de acción esbozado.",
    },
];

/** Datos del gráfico de los últimos 7 días */
const CHART_DATA = [
    { day: "Lun", height: 96, color: "bg-secondary/40", colorHover: "#7be0e8", score: 6, mood: "Calm" },
    { day: "Mar", height: 128, color: "bg-primary/40", colorHover: "#e8a5cd", score: 8, mood: "Introspective" },
    { day: "Mié", height: 80, color: "bg-[#d1e0c7]/60", colorHover: "#d1e0c7", score: 5, mood: "Joyful" },
    { day: "Jue", height: 176, color: "bg-[#7D526C]", colorHover: "#7D526C", score: 10, mood: "Anxious" },
    { day: "Vie", height: 112, color: "bg-secondary/60", colorHover: "#7be0e8", score: 7, mood: "Calm" },
    { day: "Sáb", height: 144, color: "bg-primary/60", colorHover: "#e8a5cd", score: 9, mood: "Grateful" },
    { day: "Dom", height: 96, color: "bg-[#d1e0c7]", colorHover: "#d1e0c7", score: 6, mood: "Calm" },
];

const MOOD_FILTERS = ["Todos", "Tranquilo", "Ansioso", "Feliz", "Introspectivo", "Agradecido", "Desahogo", "Neutral"];
const PAGE_SIZE = 3;

// ─── Sidebar links ────────────────────────────────────────────────────────────
const SIDEBAR_LINKS = [
    { icon: "bubble_chart", label: "Chat", mobileLabel: "Chat", route: "/chat" },
    { icon: "emergency", label: "Panel de Emergencia", mobileLabel: "Emergencia", route: "/sos" },
    { icon: "history", label: "Historial de Sesiones", mobileLabel: "Historial", route: "/historial", active: true },
    { icon: "person", label: "Perfil", mobileLabel: "Perfil", route: "/configuracion" },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
function totalMinutes(sessions) {
    return sessions.reduce((acc, s) => acc + s.minutes, 0);
}
function dominantMood(sessions) {
    const counts = {};
    sessions.forEach((s) => {
        if (Array.isArray(s.moods)) {
            s.moods.forEach((m) => { counts[m.label] = (counts[m.label] || 0) + 1; });
        }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

/** Barra individual del gráfico */
function ChartBar({ bar, index, isSelected, onClick }) {
    return (
        <div
            className="chart-bar-wrapper flex flex-col items-center gap-2 group relative flex-1"
            style={{ position: "relative" }}
        >
            {/* Tooltip */}
            <div className="chart-tooltip">
                {bar.mood} · {bar.score}/10
            </div>
            {/* Barra */}
            <div
                className={`chart-bar w-4 sm:w-6 md:w-8 lg:w-10 ${isSelected ? "" : bar.color} cursor-pointer`}
                style={{
                    height: bar.height,
                    backgroundColor: isSelected ? bar.colorHover : undefined,
                    animationDelay: `${index * 0.06}s`,
                    outline: isSelected ? `2px solid ${bar.colorHover}` : "none",
                    outlineOffset: "2px",
                }}
                onClick={() => onClick(index)}
                role="button"
                tabIndex={0}
                aria-label={`${bar.day}: ${bar.mood}`}
                onKeyDown={(e) => e.key === "Enter" && onClick(index)}
            />
            <span className="text-[10px] sm:text-xs font-medium text-on-surface-variant uppercase">{bar.day}</span>
        </div>
    );
}

/** Tarjeta de sesión */
function SessionCard({ session, onClick }) {
    return (
        <div
            className="glass-card session-item p-4 md:p-6 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-surface-container transition-colors cursor-pointer group"
            onClick={() => onClick(session)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick(session)}
        >
            <div className="flex items-center gap-3 md:gap-6 min-w-0">
                <div className={`w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full flex items-center justify-center ${session.iconColor}`}>
                    <span className="material-icons-outlined text-[20px]">mic</span>
                </div>
                <div className="min-w-0">
                    <h4 className="font-bold text-neutral truncate">{session.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant mt-1">
                        <span className="flex items-center gap-1">
                            <span className="material-icons-outlined text-[13px]">calendar_today</span>
                            {session.date}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="material-icons-outlined text-[13px]">schedule</span>
                            {String(session.minutes).padStart(2, "0")} min
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                {session.moods.map((m) => (
                    <span key={m.label} className={`mood-tag ${m.bg} ${m.text}`}>
                        {m.label}
                    </span>
                ))}
                <span className="material-icons-outlined text-outline group-hover:text-primary transition-colors ml-1">
                    chevron_right
                </span>
            </div>
        </div>
    );
}

/** Skeleton de sesión */
function SessionSkeleton() {
    return (
        <div className="glass-card p-6 rounded-xl flex items-center gap-6">
            <div className="skeleton w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3">
                <div className="skeleton h-4 w-48" />
                <div className="skeleton h-3 w-32" />
            </div>
            <div className="skeleton h-7 w-24 rounded-full" />
        </div>
    );
}

function SessionModal({ session, onClose }) {
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const togglePlay = () => {
        if (!('speechSynthesis' in window)) {
            alert("Tu navegador no soporta reproducción de voz.");
            return;
        }
        
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(session.summary);
            utterance.lang = 'es-ES';
            
            const voices = window.speechSynthesis.getVoices();
            // Buscar una voz menos robótica (Google, Online o Natural)
            let esVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Online') || v.name.includes('Natural')));
            if (!esVoice) esVoice = voices.find(v => v.lang.startsWith('es') && v.name.includes('Microsoft'));
            if (!esVoice) esVoice = voices.find(v => v.lang.startsWith('es'));
            
            if (esVoice) utterance.voice = esVoice;
            utterance.rate = 1.0;
            utterance.pitch = 1.1; // Tono más alto para sonar menos robótico
            
            utterance.onend = () => setIsPlaying(false);
            
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
        }
    };

    if (!session) return null;
    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[90] flex items-center justify-center px-6"
            onClick={() => {
                if (isPlaying) window.speechSynthesis.cancel();
                onClose();
            }}
        >
            <div
                className="glass-card bg-surface rounded-2xl p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${session.iconColor}`}>
                            <span className="material-icons-outlined">mic</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-neutral text-lg">{session.title}</h3>
                            <p className="text-xs text-on-surface-variant">{session.date} · {session.minutes} min</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant"
                        aria-label="Cerrar"
                    >
                        <span className="material-icons-outlined">close</span>
                    </button>
                </div>

                {/* Moods */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {session.moods.map((m) => (
                        <span key={m.label} className={`mood-tag ${m.bg} ${m.text}`}>{m.label}</span>
                    ))}
                </div>

                {/* Summary */}
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{session.summary}</p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button 
                        onClick={togglePlay}
                        className="flex-1 py-3 rounded-full bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-icons-outlined text-[18px]">
                            {isPlaying ? 'stop_circle' : 'play_circle'}
                        </span>
                        {isPlaying ? 'Detener' : 'Reproducir'}
                    </button>
                    <button className="flex-1 py-3 rounded-full bg-secondary/10 text-secondary font-semibold text-sm hover:bg-secondary/20 transition-colors flex items-center justify-center gap-2">
                        <span className="material-icons-outlined text-[18px]">edit_note</span>
                        Ver notas
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function MemoryLane({
    sessions: propSessions,
    userName = "Usuario",
}) {
    const navigate = useNavigate();
    // ── Estado ──────────────────────────────────────────────────────────────
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedBar, setSelectedBar] = useState(null);
    const [moodFilter, setMoodFilter] = useState("Todos");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [activeSession, setActiveSession] = useState(null);

    const [fetchedSessions, setFetchedSessions] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const identifier = currentUser.email || currentUser.uid;
                getUserSessions(identifier).then(data => {
                    setFetchedSessions(data);
                    setLoading(false);
                }).catch(err => {
                    console.error("Error fetching sessions:", err);
                    setFetchedSessions([]);
                    setLoading(false);
                });
            } else {
                setFetchedSessions([]);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const sessions = propSessions ?? fetchedSessions ?? [];

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    // ── Sidebar ─────────────────────────────────────────────────────────────
    const openSidebar = useCallback(() => setSidebarOpen(true), []);
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);
    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") { closeSidebar(); setActiveSession(null); } };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [closeSidebar]);
    useEffect(() => {
        document.body.style.overflow = (sidebarOpen || !!activeSession) ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [sidebarOpen, activeSession]);

    // ── Filtro + búsqueda ────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let result = sessions;
        if (moodFilter !== "Todos") {
            result = result.filter((s) =>
                s.moods.some((m) => m.label.toLowerCase() === moodFilter.toLowerCase())
            );
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((s) => s.title.toLowerCase().includes(q));
        }
        return result;
    }, [sessions, moodFilter, search]);

    // Resetear página al cambiar filtros
    useEffect(() => { setPage(1); }, [moodFilter, search]);

    const visible = filtered.slice(0, page * PAGE_SIZE);
    const hasMore = visible.length < filtered.length;

    // ── Stats dinámicos ──────────────────────────────────────────────────────
    const totalMins = useMemo(() => totalMinutes(sessions), [sessions]);
    const dominant = useMemo(() => dominantMood(sessions), [sessions]);
    const maxMinutes = 200; // cap de la barra de progreso

    // ── "Cargar más" simulado con skeleton ──────────────────────────────────
    const handleLoadMore = () => {
        setLoading(true);
        setTimeout(() => {
            setPage((p) => p + 1);
            setLoading(false);
        }, 700);
    };

    // ── Gráfico ──────────────────────────────────────────────────────────────
    const dynamicChartData = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            days.push(d);
        }
        const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

        return days.map(d => {
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const daySessions = sessions.filter(s => s.date === dateStr);
            const dayName = dayNames[d.getDay()];

            if (daySessions.length === 0) {
                return { day: dayName, height: 20, color: "bg-surface-container", colorHover: "#ccc", score: 0, mood: "None" };
            }

            const lastSession = daySessions[0];
            const mainMood = lastSession.moods[0];
            const score = Math.min(10, Math.max(1, lastSession.minutes / 2));
            const height = Math.min(180, Math.max(20, score * 18));

            let colorHover = "#ccc";
            if (mainMood.label === "Tranquilo") colorHover = "#7be0e8";
            else if (mainMood.label === "Introspectivo" || mainMood.label === "Agradecido") colorHover = "#e8a5cd";
            else if (mainMood.label === "Feliz") colorHover = "#d1e0c7";
            else if (mainMood.label === "Ansioso") colorHover = "#7D526C";
            else if (mainMood.label === "Desahogo") colorHover = "#d8b4e2";
            else if (mainMood.label === "Neutral") colorHover = "#a8a8a8";

            let colorBase = mainMood.bg.replace("100", "60").replace("10", "40");
            if (mainMood.label === "Ansioso") colorBase = "bg-[#7D526C]";
            else if (mainMood.label === "Neutral") colorBase = "bg-gray-400";

            return {
                day: dayName,
                height: height,
                color: colorBase,
                colorHover: colorHover,
                score: Math.round(score),
                mood: mainMood.label
            };
        });
    }, [sessions]);

    const handleBarClick = (index) => {
        setSelectedBar((prev) => (prev === index ? null : index));
    };

    const selectedDayInfo = selectedBar !== null ? dynamicChartData[selectedBar] : null;

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="font-sans antialiased min-h-screen" style={{ backgroundColor: "#fff8f9", color: "#1c1b1f" }}>

            {/* ── Modal de sesión ── */}
            <SessionModal session={activeSession} onClose={() => setActiveSession(null)} />

            {/* ── Sidebar Overlay ── */}
            <div
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={closeSidebar}
                aria-hidden="true"
            />

            {/* ── Sidebar Drawer ── */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-surface z-[70] shadow-2xl border-r border-primary/10 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                aria-label="Menú principal"
            >
                <div className="p-8 flex items-center space-x-3 border-b border-primary/10">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" opacity="0.3" />
                        <circle cx="12" cy="12" r="5" fill="currentColor" />
                    </svg>
                    <span className="text-xl font-bold tracking-tight text-neutral">Mindly</span>
                </div>
                <nav className="flex-1 py-8 px-4 space-y-2">
                    {SIDEBAR_LINKS.map((link) => (
                        <button
                            key={link.route}
                            onClick={() => { navigate(link.route); closeSidebar(); }}
                            className={`w-full flex items-center space-x-4 p-4 rounded-full transition-colors group text-left ${link.active
                                ? "bg-primary/10 text-primary"
                                : "text-on-surface-variant hover:bg-primary/5"
                                }`}
                        >
                            <span className="material-icons-outlined group-hover:text-primary">{link.icon}</span>
                            <span className={`text-sm font-semibold ${link.active ? "font-bold" : ""}`}>{link.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-8 border-t border-primary/10 flex flex-col gap-6">
                    <button className="flex items-center gap-3 text-error/70 hover:text-error transition-colors px-4 py-2 text-left" onClick={handleLogout}>
                        <span className="material-icons-outlined text-[20px]">logout</span>
                        <span className="text-sm font-semibold">Cerrar sesión</span>
                    </button>
                    <div className="flex items-center space-x-3 border-t border-primary/10 pt-6">
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border border-primary/20">
                            <span className="material-icons-outlined text-on-surface-variant">person</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-on-surface">{user?.displayName || user?.email || "Usuario"}</p>
                            <p className="text-[10px] text-outline uppercase tracking-wider">Plan Premium</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Header ── */}
            <header className="h-16 flex items-center justify-between px-4 md:px-8 lg:px-12 sticky top-0 z-50"
                style={{ backgroundColor: "rgba(255,248,249,0.8)", backdropFilter: "blur(12px)" }}>
                <div className="flex items-center gap-4">
                    <button
                        className="p-2 hover:bg-surface-container rounded-full transition-colors hidden md:block"
                        onClick={openSidebar}
                        aria-label="Abrir menú"
                    >
                        <span className="material-icons-outlined">menu</span>
                    </button>
                    <button
                        className="flex items-center gap-2"
                        onClick={() => navigate('/chat')}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" opacity="0.3" />
                            <circle cx="12" cy="12" r="5" fill="currentColor" />
                        </svg>
                        <span className="text-xl font-bold tracking-tight text-neutral">Mindly</span>
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-surface-container rounded-full transition-colors relative" aria-label="Notificaciones">
                        <span className="material-icons-outlined">notifications</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-primary/20 flex items-center justify-center">
                        <span className="material-icons-outlined text-on-surface-variant">person</span>
                    </div>
                </div>
            </header>

            {/* ── Main ── */}
            <main className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-8">

                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral mb-2">Memory Lane</h1>
                    <p className="text-sm md:text-base text-on-surface-variant max-w-3xl leading-relaxed">
                        Reflexiona sobre tu viaje emocional. Cada sesión de voz es un paso adelante hacia la claridad y el bienestar mental.
                    </p>
                </div>

                {/* ── Dashboard Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">

                    {/* Emotional Flow Chart — col 8 */}
                    <div className="lg:col-span-8 glass-card p-5 md:p-7 rounded-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-neutral">Emotional Flow</h3>
                                <p className="text-xs text-on-surface-variant uppercase tracking-wider">Last 7 Sessions</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Detalle del día seleccionado */}
                                {selectedDayInfo && (
                                    <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                                        {selectedDayInfo.day}: {selectedDayInfo.mood} ({selectedDayInfo.score}/10)
                                    </span>
                                )}
                                <span className="material-icons-outlined text-primary">bar_chart</span>
                            </div>
                        </div>

                        {/* Barras o Empty State */}
                        {sessions.length === 0 && !loading ? (
                            <div className="flex flex-col items-center justify-center h-48 md:h-56 w-full text-on-surface-variant text-center gap-3">
                                <span className="material-icons-outlined text-[48px] text-outline opacity-50">show_chart</span>
                                <div>
                                    <p className="font-semibold text-sm">Sin historial de emociones</p>
                                    <p className="text-xs opacity-80 max-w-[200px] mx-auto mt-1">Completa tu primera sesión con la IA para ver tu flujo emocional aquí.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-end justify-between gap-1 h-48 md:h-56 px-1 md:px-3 w-full overflow-hidden">
                                {dynamicChartData.map((bar, i) => (
                                    <ChartBar
                                        key={i}
                                        bar={bar}
                                        index={i}
                                        isSelected={selectedBar === i}
                                        onClick={handleBarClick}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Leyenda de colores de mood */}
                        <div className="mt-5 flex flex-wrap gap-3">
                            {[
                                { label: "Tranquilo", color: "#7be0e8" },
                                { label: "Introspectivo", color: "#e8a5cd" },
                                { label: "Feliz", color: "#d1e0c7" },
                                { label: "Ansioso", color: "#7D526C" },
                                { label: "Agradecido", color: "#e8a5cd" },
                                { label: "Desahogo", color: "#d8b4e2" },
                                { label: "Neutral", color: "#a8a8a8" },
                            ].map((item) => (
                                <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-on-surface-variant font-medium">
                                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                                    {item.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Stats Sidebar — col 4 */}
                    <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">

                        {/* Minutes Recorded */}
                        <div className="stat-card bg-primary/10 p-5 md:p-7 rounded-2xl border border-primary/20 flex flex-col justify-between gap-3">
                            <span className="material-icons-outlined text-primary">bolt</span>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-neutral">{totalMins}</h2>
                                <p className="text-sm text-on-surface-variant mb-3">Minutos Registrados</p>
                                {/* Barra de progreso */}
                                <div className="h-1.5 bg-primary/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full minutes-bar-fill"
                                        style={{ width: `${Math.min((totalMins / maxMinutes) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-outline mt-1 uppercase tracking-wider">
                                    Meta: {maxMinutes} min/mes
                                </p>
                            </div>
                        </div>

                        {/* Dominant Mood */}
                        <div className="stat-card bg-secondary/10 p-5 md:p-7 rounded-2xl border border-secondary/20 flex flex-col justify-between gap-3">
                            <span className="material-icons-outlined text-secondary">psychology</span>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-neutral">{dominant}</h2>
                                <p className="text-sm text-on-surface-variant mb-2">Emoción Dominante</p>
                                <p className="text-[11px] text-outline">
                                    Basado en {sessions.length} sesiones
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Recent Sessions ── */}
                <div>
                    {/* Header con buscador y filtros */}
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                        <h3 className="text-xl font-bold text-neutral">Sesiones Recientes</h3>
                        <div className="flex items-center gap-3">
                            {/* Búsqueda */}
                            <div className="relative">
                                <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">
                                    search
                                </span>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Buscar sesión..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    aria-label="Buscar sesión"
                                />
                            </div>
                            <button
                                className="text-primary font-semibold text-sm hover:underline"
                                onClick={() => { setMoodFilter("Todos"); setSearch(""); }}
                            >
                                Ver Todo
                            </button>
                        </div>
                    </div>

                    {/* Chips de filtro de mood */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {MOOD_FILTERS.map((mood) => (
                            <button
                                key={mood}
                                className={`filter-chip ${moodFilter === mood ? "active" : "inactive"}`}
                                onClick={() => setMoodFilter(mood)}
                                aria-pressed={moodFilter === mood}
                            >
                                {mood}
                            </button>
                        ))}
                    </div>

                    {/* Lista */}
                    <div className="space-y-4">
                        {visible.length === 0 && !loading && (
                            <div className="text-center py-16 text-on-surface-variant">
                                <span className="material-icons-outlined text-[48px] mb-4 block text-outline">
                                    search_off
                                </span>
                                <p className="font-semibold">No se encontraron sesiones</p>
                                <p className="text-sm mt-1">Prueba con otro filtro o término de búsqueda.</p>
                            </div>
                        )}
                        {visible.map((session) => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                onClick={setActiveSession}
                            />
                        ))}
                        {loading && [1, 2].map((k) => <SessionSkeleton key={k} />)}
                    </div>

                    {/* Load More */}
                    {hasMore && !loading && (
                        <div className="mt-12 text-center">
                            <button className="btn-load-more" onClick={handleLoadMore}>
                                Cargar sesiones anteriores
                            </button>
                        </div>
                    )}
                    {!hasMore && filtered.length > 0 && (
                        <p className="mt-10 text-center text-xs text-outline uppercase tracking-wider">
                            Has visto todas las sesiones ({filtered.length})
                        </p>
                    )}
                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="mt-12 py-8 px-4 md:px-8 lg:px-12 border-t border-primary/10 bg-primary/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <h4 className="text-xl font-bold text-neutral">Mindly</h4>
                        <p className="text-xs text-on-surface-variant mt-2">© 2026 Mindly. Digital Sanctuary for your mind.</p>
                    </div>
                    <div className="flex gap-8 text-sm text-on-surface-variant font-medium">
                        <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-primary transition-colors">Términos</a>
                        <a href="#" className="hover:text-primary transition-colors">Contacto</a>
                    </div>
                </div>
            </footer>

            {/* Navbar Inferior (Solo Móvil) */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-primary/10 z-[50] flex justify-around items-center h-16 px-2 pb-safe" style={{ backgroundColor: "var(--color-surface, #fff)" }}>
                {SIDEBAR_LINKS.map((link) => (
                    <button
                        key={link.route}
                        onClick={() => navigate(link.route)}
                        className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 ${link.active ? "text-primary" : "text-on-surface-variant"
                            }`}
                        style={{ color: link.active ? "var(--color-primary, #e8a5cd)" : "var(--color-on-surface-variant, #82737a)", background: "transparent", border: "none" }}
                    >
                        <span className="material-icons-outlined text-[24px]">
                            {link.icon}
                        </span>
                        <span className="text-[10px] font-semibold text-center px-1 truncate w-full">{link.mobileLabel || link.label}</span>
                    </button>
                ))}
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center flex-1 h-full space-y-1 text-on-surface-variant"
                    style={{ background: "transparent", border: "none" }}
                >
                    <span className="material-icons-outlined text-[24px]">
                        logout
                    </span>
                    <span className="text-[10px] font-semibold">Salir</span>
                </button>
            </nav>
        </div>
    );
}