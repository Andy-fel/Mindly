import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { getUserSettings, saveUserSettings } from '../../backend/SettingsService';
import './settings_style.css';

// ─── Toggle Switch ──────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
    return (
        <div
            className={"toggle-wrapper" + (checked ? " checked" : "")}
            onClick={() => onChange(!checked)}
            role="switch"
            aria-checked={checked}
            tabIndex={0}
            onKeyDown={(e) => e.key === " " && onChange(!checked)}
        >
            <div className="toggle-track" />
            <div className="toggle-thumb" />
        </div>
    );
}

// ─── Voice Persona Card ─────────────────────────────────────────────────────
function VoiceCard({ name, description, selected, onClick }) {
    return (
        <div className={"voice-card" + (selected ? " selected" : "")} onClick={onClick}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18, color: selected ? "var(--color-primary)" : "var(--color-outline-variant)" }}
                >
                    {selected ? "radio_button_checked" : "radio_button_unchecked"}
                </span>
                <p style={{ fontWeight: 700, color: selected ? "var(--color-on-surface)" : "rgba(31,26,29,0.6)" }}>
                    {name}
                </p>
            </div>
            <p style={{ fontSize: 10, lineHeight: 1.4, color: "var(--color-neutral-text)" }}>{description}</p>
        </div>
    );
}

// ─── Contact Item ───────────────────────────────────────────────────────────
function ContactItem({ initials, name, relation, phone, onDelete, color }) {
    const bgMap = { primary: "rgba(232,165,205,0.3)", secondary: "rgba(139,239,247,0.5)" };
    const colorMap = { primary: "var(--color-primary)", secondary: "var(--color-secondary)" };
    return (
        <div className="contact-item">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: bgMap[color] || bgMap.primary,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: colorMap[color] || colorMap.primary,
                    fontWeight: 700, fontSize: 12, flexShrink: 0,
                }}>
                    {initials}
                </div>
                <div>
                    <p style={{ fontWeight: 700, color: "var(--color-on-surface)", fontSize: 14 }}>{name}</p>
                    <p style={{ color: "var(--color-neutral-text)", fontSize: 12 }}>{relation} • {phone}</p>
                </div>
            </div>
            <button className="btn-delete" onClick={onDelete} aria-label={"Eliminar " + name}>
                <span className="material-symbols-outlined">delete</span>
            </button>
        </div>
    );
}

// ─── Toast ──────────────────────────────────────────────────────────────────
function Toast({ message, visible }) {
    return <div className={"toast" + (visible ? " show" : "")}>{message}</div>;
}

// ─── Add Contact Modal ──────────────────────────────────────────────────────
function AddContactModal({ onClose, onAdd }) {
    const [form, setForm] = useState({ name: "", relation: "", phone: "" });
    const submit = () => {
        if (!form.name.trim()) return;
        const initials = form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
        onAdd({ ...form, initials, color: "primary" });
        onClose();
    };
    return (
        <div
            style={{
                position: "fixed", inset: 0, background: "rgba(53,47,49,0.5)",
                backdropFilter: "blur(4px)", zIndex: 200,
                display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "var(--color-surface-container-lowest)", borderRadius: 16,
                    padding: 32, width: "100%", maxWidth: 420,
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.2)",
                }}
                onClick={e => e.stopPropagation()}
            >
                <h3 style={{ fontWeight: 700, fontSize: 20, color: "var(--color-on-surface)", marginBottom: 24 }}>
                    Agregar Contacto de Confianza
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[
                        { label: "Nombre Completo", key: "name", placeholder: "Ej. María López" },
                        { label: "Relación", key: "relation", placeholder: "Ej. Madre, Terapeuta" },
                        { label: "Teléfono", key: "phone", placeholder: "(300) 000-0000" },
                    ].map(({ label, key, placeholder }) => (
                        <div key={key} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <label style={{ fontSize: 14, fontWeight: 600, color: "var(--color-neutral-text)", letterSpacing: "0.05em" }}>
                                {label}
                            </label>
                            <input
                                className="mindly-input"
                                placeholder={placeholder}
                                value={form[key]}
                                onChange={e => setForm({ ...form, [key]: e.target.value })}
                            />
                        </div>
                    ))}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 24 }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "var(--color-neutral-text)", fontFamily: "Montserrat, sans-serif",
                            fontWeight: 600, fontSize: 14,
                        }}
                    >
                        Cancel
                    </button>
                    <button className="btn-primary" onClick={submit}>Agregar Contacto</button>
                </div>
            </div>
        </div>
    );
}

const SIDEBAR_LINKS = [
    { icon: "bubble_chart", label: "Chat", mobileLabel: "Chat", route: "/chat" },
    { icon: "emergency", label: "Panel de Emergencia", mobileLabel: "Emergencia", route: "/sos" },
    { icon: "history", label: "Historial de Sesiones", mobileLabel: "Historial", route: "/historial" },
    { icon: "person", label: "Perfil", mobileLabel: "Perfil", route: "/configuracion", active: true },
];

// ─── Main Component ─────────────────────────────────────────────────────────
export default function ProfileSettings() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [voicePersona, setVoicePersona] = useState("Calm");
    const [frequency, setFrequency] = useState(3);
    const [contacts, setContacts] = useState([]);
    const [emergencyLine, setEmergencyLine] = useState("106");
    const [notifications, setNotifications] = useState({ push: true, weekly: true, quiet: false });
    const [formData, setFormData] = useState({
        legalName: "", preferredName: "", email: "",
    });
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState({ message: "", visible: false });
    const [user, setUser] = useState(null);
    const toastTimer = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Fill personal info from Firebase Auth
                setFormData({
                    legalName: currentUser.displayName || "",
                    preferredName: currentUser.displayName ? currentUser.displayName.split(" ")[0] : "",
                    email: currentUser.email || "",
                });
                const identifier = currentUser.email || currentUser.uid;
                getUserSettings(identifier).then(data => {
                    if (data) {
                        setVoicePersona(data.voicePersona || "Calm");
                        setFrequency(data.frequency || 3);
                        setNotifications(data.notifications || { push: true, weekly: true, quiet: false });
                        setEmergencyLine(data.emergencyLine || "106");
                        if (data.trustedContact) {
                            setContacts([data.trustedContact]);
                        } else {
                            setContacts([]);
                        }
                    }
                }).catch(err => console.error(err));
            } else {
                setContacts([]);
                setFormData({ legalName: "", preferredName: "", email: "" });
            }
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

    // Lock scroll when sidebar open
    useEffect(() => {
        document.body.style.overflow = sidebarOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [sidebarOpen]);

    const showToast = (msg) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ message: msg, visible: true });
        toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    };

    const handleSave = async () => {
        if (!formData.email.includes("@")) { showToast("⚠️ Ingresa un correo válido."); return; }
        if (user) {
            try {
                const identifier = user.email || user.uid;
                await saveUserSettings(identifier, {
                    voicePersona,
                    frequency,
                    notifications,
                    emergencyLine,
                    trustedContact: contacts.length > 0 ? contacts[0] : null
                });
                showToast("✓ Preferencias guardadas correctamente.");
            } catch (err) {
                showToast("⚠️ Error al guardar preferencias.");
            }
        } else {
            showToast("⚠️ Debes iniciar sesión para guardar.");
        }
    };

    const handleDiscard = () => {
        setFormData({ legalName: user?.displayName || "", preferredName: user?.displayName ? user.displayName.split(" ")[0] : "", email: user?.email || "" });
        setVoicePersona("Calm");
        setFrequency(3);
        setNotifications({ push: true, weekly: true, quiet: false });
        showToast("Cambios descartados.");
    };

    const frequencyLabel = `${frequency} ${frequency === 1 ? "vez" : "veces"} / día`;

    return (
        <div
            className="aurora-gradient"
            style={{ minHeight: "100vh", fontFamily: "Montserrat, sans-serif", background: "var(--color-background)" }}
        >
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

            {/* Main */}
            <main style={{ paddingTop: 96, paddingBottom: 48, paddingLeft: 20, paddingRight: 20, maxWidth: 768, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>

                {/* 1. Personal Information */}
                <section className="section-card card-shadow">
                    <div style={{ position: "absolute", top: 32, right: 32 }}>
                        <div style={{ position: "relative", cursor: "pointer" }}>
                            {user?.photoURL ? (
                                <img
                                    alt="Profile"
                                    src={user.photoURL}
                                    style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-primary-container)", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", display: "block" }}
                                />
                            ) : (
                                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-surface-container)", border: "2px solid var(--color-primary-container)", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <span className="material-icons-outlined" style={{ fontSize: 32, color: "var(--color-on-surface-variant)" }}>person</span>
                                </div>
                            )}
                            <div style={{ position: "absolute", bottom: -4, right: -4, background: "var(--color-primary)", padding: 6, borderRadius: "50%", border: "2px solid var(--color-surface-container-lowest)", display: "flex" }}>
                                <span className="material-symbols-outlined" style={{ color: "white", fontSize: 12, lineHeight: 1 }}>edit</span>
                            </div>
                        </div>
                    </div>
                    <header style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 32, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 4, lineHeight: 1.3 }}>Información Personal</h2>
                        <p style={{ color: "var(--color-neutral-text)", fontSize: 14 }}>Actualiza tus datos básicos usados en las sesiones terapéuticas.</p>
                    </header>
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                            {[
                                { label: "Nombre Completo", key: "legalName" },
                                { label: "Nombre Preferido", key: "preferredName" },
                            ].map(({ label, key }) => (
                                <div key={key} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <label style={{ fontSize: 14, fontWeight: 600, color: "var(--color-neutral-text)", letterSpacing: "0.05em", paddingLeft: 4 }}>{label}</label>
                                    <input className="mindly-input" type="text" value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <label style={{ fontSize: 14, fontWeight: 600, color: "var(--color-neutral-text)", letterSpacing: "0.05em", paddingLeft: 4 }}>Correo Electrónico</label>
                            <input className="mindly-input" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>
                </section>

                {/* 2. A.I.S.E Intelligence Settings */}
                <section className="section-card card-shadow">
                    <header style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 32, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 4, lineHeight: 1.3 }}>Configuración de A.I.S.E</h2>
                        <p style={{ color: "var(--color-neutral-text)", fontSize: 14 }}>Personaliza la presencia vocal y la capacidad de respuesta de tu compañero IA.</p>
                    </header>
                    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                        <div>
                            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--color-neutral-text)", letterSpacing: "0.05em", marginBottom: 16 }}>Personalidad de Voz</label>
                            <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                                {[
                                    { name: "Calm", description: "Tono suave, calmante y melodioso." },
                                    { name: "Steady", description: "Directo, centrado y rítmico." },
                                    { name: "Bright", description: "Energético, motivador y claro." },
                                ].map(({ name, description }) => (
                                    <VoiceCard key={name} name={name} description={description} selected={voicePersona === name} onClick={() => setVoicePersona(name)} />
                                ))}
                            </div>
                        </div>
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
                                <label style={{ fontSize: 14, fontWeight: 600, color: "var(--color-neutral-text)", letterSpacing: "0.05em" }}>Frecuencia de Revisión</label>
                                <span style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: 14 }}>{frequencyLabel}</span>
                            </div>
                            <input
                                type="range" min="1" max="10" value={frequency}
                                onChange={e => setFrequency(Number(e.target.value))}
                                style={{ width: "100%", height: 6, background: "var(--color-surface-container)", borderRadius: 9999, appearance: "none", cursor: "pointer" }}
                            />
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                                {["Baja Presencia", "Alta Presencia"].map(l => (
                                    <span key={l} style={{ fontSize: 10, fontWeight: 700, color: "var(--color-outline-variant)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{l}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Trusted Contacts */}
                <section className="section-card card-shadow">
                    <header style={{ marginBottom: 32 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                            <h2 style={{ fontSize: 32, fontWeight: 600, color: "var(--color-on-surface)", lineHeight: 1.3 }}>Contactos de Confianza</h2>
                            <span style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 9999, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                                SOS Emergencia
                            </span>
                        </div>
                        <p style={{ color: "var(--color-neutral-text)", fontSize: 14 }}>Personas a las que Mindly contactará si detecta una crisis.</p>
                    </header>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                        <label style={{ fontSize: 14, fontWeight: 600, color: "var(--color-neutral-text)", letterSpacing: "0.05em", paddingLeft: 4 }}>Línea de Emergencia</label>
                        <input className="mindly-input" type="text" value={emergencyLine} onChange={e => setEmergencyLine(e.target.value)} placeholder="Ej. 106, 911" />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                        {contacts.length === 0 && (
                            <p style={{ textAlign: "center", color: "var(--color-neutral-text)", fontSize: 14, padding: "24px 0" }}>Aún no tienes contactos de confianza.</p>
                        )}
                        {contacts.map((c, i) => (
                            <ContactItem key={i} {...c} onDelete={() => { setContacts(prev => prev.filter((_, idx) => idx !== i)); showToast("Contacto eliminado."); }} />
                        ))}
                    </div>
                    {contacts.length === 0 && (
                        <button className="btn-dashed" onClick={() => setShowModal(true)}>
                            <span className="material-symbols-outlined">add_circle</span>
                            Agregar Contacto de Confianza
                        </button>
                    )}
                </section>

                {/* 4. Notification Hub */}
                <section className="section-card card-shadow">
                    <header style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 32, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 4, lineHeight: 1.3 }}>Centro de Notificaciones</h2>
                        <p style={{ color: "var(--color-neutral-text)", fontSize: 14 }}>Elige cómo quieres que te recordemos respirar.</p>
                    </header>
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {[
                            { key: "push", icon: "notifications", iconBg: "rgba(232,165,205,0.2)", iconColor: "var(--color-primary)", title: "Notificaciones Push", subtitle: "Recordatorios terapéuticos en tiempo real." },
                            { key: "weekly", icon: "mail", iconBg: "rgba(139,239,247,0.2)", iconColor: "var(--color-secondary)", title: "Reflexiones Semanales", subtitle: "Resumen semanal detallado de tu estado de ánimo." },
                            { key: "quiet", icon: "do_not_disturb_on", iconBg: "var(--color-surface-container)", iconColor: "var(--color-neutral-text)", title: "Horas de Silencio", subtitle: "Silenciar todas las alertas no-SOS después de las 10:00 PM." },
                        ].map(({ key, icon, iconBg, iconColor, title, subtitle }) => (
                            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                    <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: iconBg, color: iconColor, flexShrink: 0 }}>
                                        <span className="material-symbols-outlined">{icon}</span>
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, color: "var(--color-on-surface)", fontSize: 14 }}>{title}</p>
                                        <p style={{ color: "var(--color-neutral-text)", fontSize: 12 }}>{subtitle}</p>
                                    </div>
                                </div>
                                <Toggle checked={notifications[key]} onChange={val => setNotifications({ ...notifications, [key]: val })} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. Footer Actions */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 32, paddingTop: 16 }}>
                    <button
                        onClick={handleDiscard}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-neutral-text)", fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: "0.05em" }}
                    >
                        Descartar Cambios
                    </button>
                    <button className="btn-primary" onClick={handleSave}>Guardar Preferencias</button>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ background: "var(--color-surface-container-lowest)", width: "100%", borderRadius: "12px 12px 0 0", marginTop: 48 }}>
                <div className="footer-inner" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "48px 24px", maxWidth: 1280, margin: "0 auto", gap: 32 }}>
                    <div className="footer-brand" style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-primary)", fontFamily: "Montserrat, sans-serif" }}>Mindly</div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface-variant)", letterSpacing: "0.05em" }}>© 2024 Mindly. Un santuario digital para tu mente.</p>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24 }}>
                        {["Política de Privacidad", "Términos de Servicio", "Recursos SOS", "Soporte"].map(label => (
                            <a key={label} href="#" className="footer-link" onClick={e => e.preventDefault()}>{label}</a>
                        ))}
                    </div>
                </div>
            </footer>

            {/* Modal */}
            {showModal && <AddContactModal onClose={() => setShowModal(false)} onAdd={(c) => { setContacts(prev => [...prev, c]); showToast("✓ Contacto agregado."); }} />}

            {/* Toast */}
            <Toast message={toast.message} visible={toast.visible} />

            {/* Navbar Inferior (Solo Móvil) */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-primary/10 z-[50] flex justify-around items-center h-16 px-2 pb-safe" style={{ backgroundColor: "var(--color-surface)" }}>
                {SIDEBAR_LINKS.map((link) => (
                    <button
                        key={link.route}
                        onClick={() => navigate(link.route)}
                        className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 ${link.active ? "text-primary" : "text-on-surface-variant"
                            }`}
                        style={{ color: link.active ? "var(--color-primary)" : "var(--color-on-surface-variant)", background: "transparent", border: "none" }}
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