import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

import "./dashboard_style.css";

/* ─── DATOS ─── */
const MOODS = [
    { emoji: "😊", label: "Feliz" },
    { emoji: "😌", label: "Tranquilo" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "😔", label: "Triste" },
    { emoji: "😰", label: "Ansioso" },
];

// Semana actual simplificada
const TODAY = 22;
const CHECKED_DAYS = [4, 5, 6, 10, 11, 12, 13, 14, 19, 20, 21, TODAY];
const MONTH_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const DAY_LABELS = ["L", "L", "M", "J", "V", "S", "D"];

const COMMUNITY_USERS = [
    { seed: "Ana", online: true },
    { seed: "Carlos", online: true },
    { seed: "Sofia", online: true },
    { seed: "Marco", online: true },
    { seed: "Lucia", online: true },
];

const SIDEBAR_LINKS = [
    { icon: "dashboard", label: "Dashboard", route: "/dashboard", active: true },
    { icon: "mood", label: "Mood", route: "/chat" },
    { icon: "air", label: "Breath", route: "/sos" },
    { icon: "edit_note", label: "Journal", route: "/historial" },
    { icon: "person", label: "Me", route: "/configuracion" },
];

/* ─── COMPONENTE ─── */
export default function MindlyDashboard() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedMood, setSelectedMood] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioProgress, setAudioProgress] = useState(38);
    const [currentMonth, setCurrentMonth] = useState("Icvana 2024");
    const [user, setUser] = useState(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const openSidebar = () => setSidebarOpen(true);
    const closeSidebar = () => setSidebarOpen(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") closeSidebar(); };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, []);

    useEffect(() => {
        document.body.style.overflow = sidebarOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [sidebarOpen]);



    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setAudioProgress(p => p >= 100 ? 0 : p + 0.4);
            }, 200);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying]);

    const pct = `${audioProgress.toFixed(0)}%`;

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fdf6f8" }}>

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
                        onClick={() => navigate('/dashboard')}
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

            {/* ── MAIN ── */}
            <main style={{ flex: 1, maxWidth: 1600, margin: "0 auto", padding: "16px 32px", width: "100%" }}>

                {/* ROW 1: Mood + Calendario */}
                <div className="dashboard-grid-top">

                    {/* Mood Card */}
                    <div className="mly-card fade-up d1" style={{
                        background: "linear-gradient(135deg, #fff0f6 0%, #f0f9ff 100%)",
                        display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", padding: "36px 32px", gap: 20,
                    }}>
                        <h2 style={{ fontSize: 26, fontWeight: 700, color: "#2d1b2e", textAlign: "center" }}>
                            Hola, ¿cómo te sientes?
                        </h2>

                        {/* Emojis */}
                        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                            {MOODS.map((m, i) => (
                                <button
                                    key={m.label}
                                    className={`mood-btn${selectedMood === i ? " selected" : ""}`}
                                    onClick={() => setSelectedMood(i)}
                                    title={m.label}
                                >
                                    {m.emoji}
                                </button>
                            ))}
                        </div>

                        <p style={{ color: "#82737a", fontSize: 14 }}>
                            {selectedMood !== null
                                ? `Seleccionaste: ${MOODS[selectedMood].label} ${MOODS[selectedMood].emoji}`
                                : "Selecciona tu estado de ánimo"}
                        </p>
                    </div>

                    {/* Calendario */}
                    <div className="mly-card fade-up d2">
                        {/* Header calendario */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: "50%",
                                background: "#f5edf2", display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#844c70" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                                </svg>
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 15, color: "#2d1b2e", lineHeight: 1.2 }}>Racha de</p>
                                <p style={{ fontWeight: 700, fontSize: 15, color: "#2d1b2e" }}>Meditación</p>
                            </div>
                        </div>

                        {/* Nav mes */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#82737a", fontSize: 16 }}>‹</button>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#3d2b36" }}>{currentMonth}</span>
                            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#82737a", fontSize: 16 }}>›</button>
                        </div>

                        {/* Labels días */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
                            {DAY_LABELS.map((d, i) => (
                                <div key={i} style={{ textAlign: "center", fontSize: 11, color: "#82737a", fontWeight: 600, padding: "2px 0" }}>{d}</div>
                            ))}
                        </div>

                        {/* Días — offset 2 para que empiece en miércoles como la imagen */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                            {Array.from({ length: 2 }).map((_, i) => <div key={`e${i}`} />)}
                            {MONTH_DAYS.map(day => {
                                const isChecked = CHECKED_DAYS.includes(day);
                                const isToday = day === TODAY;
                                return (
                                    <div
                                        key={day}
                                        className={`cal-day${isChecked ? " checked" : ""}${isToday ? " today" : ""}`}
                                        style={{ margin: "0 auto" }}
                                    >
                                        {isChecked
                                            ? <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg>
                                            : day}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Racha */}
                        <div style={{ textAlign: "center", marginTop: 12 }}>
                            <span style={{
                                fontSize: 13, fontWeight: 700, color: "#844c70",
                                background: "#f5edf2", padding: "4px 16px", borderRadius: 9999,
                            }}>
                                5 Dias Seguidos
                            </span>
                        </div>
                    </div>
                </div>

                {/* ROW 2: Tu Viaje (barra de niveles) */}
                <div className="mly-card fade-up d3" style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b2e" }}>Tu Viaje</h3>
                        <span style={{ fontSize: 13, color: "#82737a", fontWeight: 500 }}>70% Completado</span>
                    </div>

                    {/* Barra con tooltip */}
                    <div style={{ position: "relative", marginBottom: 12 }}>
                        {/* Tooltip */}
                        <div style={{
                            position: "absolute",
                            left: "calc(70% - 60px)",
                            bottom: "calc(100% + 8px)",
                            background: "#2d1b2e",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "5px 12px",
                            borderRadius: 8,
                            whiteSpace: "nowrap",
                            pointerEvents: "none",
                        }}>
                            70% Completado
                            <div style={{
                                position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)",
                                width: 0, height: 0,
                                borderLeft: "5px solid transparent",
                                borderRight: "5px solid transparent",
                                borderTop: "5px solid #2d1b2e",
                            }} />
                        </div>

                        {/* Track */}
                        <div style={{
                            height: 14, borderRadius: 9999,
                            background: "rgba(220,200,210,0.3)",
                            overflow: "hidden",
                        }}>
                            <div
                                className="progress-fill"
                                style={{ "--w": "70%", width: "70%" }}
                            />
                        </div>
                    </div>

                    {/* Labels niveles */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#82737a", fontWeight: 500 }}>Nivel 1</span>
                        <span style={{ fontSize: 12, color: "#82737a", fontWeight: 500 }}>Nivel 2</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 12, color: "#82737a", fontWeight: 500 }}>Nivel 3</span>
                            <div style={{
                                width: 28, height: 28, borderRadius: "50%",
                                background: "rgba(220,200,210,0.35)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#82737a" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ROW 3: Audio + Comunidad */}
                <div className="dashboard-grid-bottom">

                    {/* Audio Player */}
                    <div className="mly-card fade-up d4">
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2d1b2e", marginBottom: 20 }}>Meditación Musical</h3>

                        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                            {/* Artwork */}
                            <div style={{
                                width: 90, height: 90, borderRadius: 16, overflow: "hidden", flexShrink: 0,
                                background: "linear-gradient(135deg, #b3e5fc, #e1bee7)",
                            }}>
                                <svg width="90" height="90" viewBox="0 0 90 90">
                                    <defs>
                                        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#b3d9f7" />
                                            <stop offset="100%" stopColor="#fce4ec" />
                                        </linearGradient>
                                    </defs>
                                    <rect width="90" height="90" fill="url(#skyGrad)" />
                                    {/* Agua */}
                                    <rect x="0" y="55" width="90" height="35" fill="#7cc8e8" opacity="0.6" />
                                    {/* Montañas */}
                                    <polygon points="0,55 25,20 50,55" fill="#6fa8c8" opacity="0.7" />
                                    <polygon points="20,55 50,15 80,55" fill="#5b8fa8" opacity="0.8" />
                                    <polygon points="45,55 70,28 90,55" fill="#7ab3c8" opacity="0.7" />
                                    {/* Sol */}
                                    <circle cx="68" cy="22" r="9" fill="#ffd54f" opacity="0.85" />
                                </svg>
                            </div>

                            {/* Info + controles */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 11, color: "#b77fb0", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 2 }}>PODCAST</p>
                                <p style={{ fontSize: 15, fontWeight: 700, color: "#2d1b2e", marginBottom: 12 }}>Sonidos de la Naturaleza</p>

                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    {/* Play button */}
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        style={{
                                            width: 40, height: 40, borderRadius: "50%",
                                            background: "#9c5baa", border: "none", cursor: "pointer",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0, transition: "transform 0.15s",
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
                                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                    >
                                        {isPlaying
                                            ? <svg width="16" height="16" fill="#fff" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                                            : <svg width="16" height="16" fill="#fff" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        }
                                    </button>

                                    {/* Range */}
                                    <input
                                        type="range"
                                        className="audio-range"
                                        min={0} max={100}
                                        value={audioProgress}
                                        onChange={e => setAudioProgress(Number(e.target.value))}
                                        style={{ flex: 1, "--pct": pct }}
                                    />

                                    {/* Spotify icon */}
                                    <div style={{
                                        width: 28, height: 28, borderRadius: "50%",
                                        background: "#1db954", display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0,
                                    }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 14.36a.75.75 0 0 1-1.03.25c-2.82-1.73-6.37-2.12-10.55-1.16a.75.75 0 1 1-.34-1.46c4.57-1.05 8.49-.6 11.67 1.34.36.22.47.69.25 1.03zm1.24-2.77a.94.94 0 0 1-1.29.31c-3.23-1.99-8.14-2.56-11.96-1.4a.94.94 0 1 1-.54-1.79c4.37-1.33 9.8-.68 13.48 1.59.44.27.58.85.31 1.29zm.1-2.88c-3.87-2.3-10.25-2.51-13.94-1.39a1.12 1.12 0 1 1-.65-2.15c4.24-1.29 11.28-1.04 15.73 1.6.57.34.75 1.07.42 1.64a1.12 1.12 0 0 1-1.56.3z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comunidad */}
                    <div className="mly-card fade-up d5" style={{ position: "relative", overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#844c70" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2d1b2e" }}>Apoyo de la<br />Comunidad</h3>
                        </div>

                        {/* Grid avatares */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 52px)", gap: 12 }}>
                            {COMMUNITY_USERS.map((u, i) => (
                                <div key={u.seed} style={{ position: "relative", width: 52, height: 52 }}>
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.seed}`}
                                        alt={u.seed}
                                        style={{
                                            width: 52, height: 52, borderRadius: "50%",
                                            border: "2.5px solid #fff",
                                            background: "#f5edf2",
                                        }}
                                    />
                                    {u.online && (
                                        <div style={{
                                            position: "absolute", bottom: 2, right: 2,
                                            width: 12, height: 12, borderRadius: "50%",
                                            background: "#4caf50", border: "2px solid #fff",
                                        }} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* FAB comunidad */}
                        <div style={{
                            position: "absolute", bottom: -10, right: -10,
                            width: 88, height: 88, borderRadius: "50%",
                            background: "linear-gradient(135deg, #e8a5cd, #ce93d8)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 6px 20px rgba(183,127,176,0.35)",
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                <circle cx="12" cy="12" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="12" r="2" />
                            </svg>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── FOOTER ── */}
            <footer style={{
                background: "#fff",
                borderTop: "1px solid rgba(220,200,210,0.35)",
                padding: "20px 40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
            }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#844c70" }}>Mindly</span>
                <span style={{ fontSize: 13, color: "#82737a" }}>© 2024 Mindly. Digital Sanctuary for your mind.</span>
                <div style={{ display: "flex", gap: 20 }}>
                    {["Privacidad", "Términos", "Contacto"].map(l => (
                        <a key={l} href="#">{l}</a>
                    ))}
                </div>
            </footer>

            {/* Navbar Inferior (Solo Móvil) */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-primary/10 z-[50] flex justify-around items-center h-16 px-2 pb-safe" style={{ backgroundColor: "var(--color-surface, #fff)" }}>
                {SIDEBAR_LINKS.map((link) => (
                    <button
                        key={link.route}
                        onClick={() => navigate(link.route)}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                            link.active ? "text-primary" : "text-on-surface-variant"
                        }`}
                        style={{ color: link.active ? "var(--color-primary, #e8a5cd)" : "var(--color-on-surface-variant, #82737a)", background: "transparent", border: "none" }}
                    >
                        <span className="material-icons-outlined text-[24px]">
                            {link.icon}
                        </span>
                        <span className="text-[10px] font-semibold">{link.label}</span>
                    </button>
                ))}
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center w-full h-full space-y-1 text-on-surface-variant"
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