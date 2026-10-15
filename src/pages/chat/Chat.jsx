import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useVoiceLogic } from '../../backend/Voice_logic.js';
import './Chat_Style.css';

const SIDEBAR_LINKS = [
  { icon: "bubble_chart", label: "Chat", mobileLabel: "Chat", route: "/chat", active: true },
  { icon: "emergency", label: "Panel de Emergencia", mobileLabel: "Emergencia", route: "/sos" },
  { icon: "history", label: "Historial de Sesiones", mobileLabel: "Historial", route: "/historial" },
  { icon: "person", label: "Perfil", mobileLabel: "Perfil", route: "/configuracion" },
];

const VoiceInterface = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const {
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
    initTTS
  } = useVoiceLogic();

  const [textInput, setTextInput] = useState('');
  const [user, setUser] = useState(null);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Auto-scroll del chat hacia abajo cuando hay nuevos mensajes
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTextMode]);

  const handleSendText = () => {
    if (textInput.trim()) {
      initTTS(); // Desbloquear TTS en iOS
      sendMessage(textInput);
      setTextInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendText();
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden text-on-surface bg-[#fff8f9] font-['Montserrat']">
      {/* Capa de fondo Aurora */}
      <div className="aurora-bg"></div>

      {/* ── Sidebar Overlay ── */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      {/* ── Sidebar Drawer ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-surface z-[70] shadow-2xl border-r border-primary/10 flex flex-col transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
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
              onClick={() => { navigate(link.route); toggleSidebar(); }}
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

      {/* Capa de Interfaz Principal */}
      <div className="relative z-10 flex flex-col h-full px-container-padding-mobile md:px-container-padding-desktop py-10">
        <header className="flex justify-between items-start w-full mb-8 shrink-0">
          <button
            className="glass-button w-12 h-12 hidden md:flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary active:scale-95"
            onClick={toggleSidebar}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2">
            <h1 className="font-headline-md text-headline-md text-primary opacity-80 tracking-widest hidden md:block">A.I.S.E.</h1>
            <p className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-neutral-custom/60 hidden md:block">Mindful Resonance</p>
          </div>
          <div className="flex items-center gap-2">
            {isTextMode && (
              <button
                onClick={toggleMode}
                className="glass-button w-12 h-12 flex md:hidden items-center justify-center rounded-full border-primary/20 text-primary hover:bg-primary/5 active:scale-95 transition-colors"
                title="Modo Voz"
              >
                <span className="material-symbols-outlined">graphic_eq</span>
              </button>
            )}
            <button
              className="glass-button px-4 md:px-6 h-12 flex items-center gap-2 rounded-full border-primary/20 text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
              onClick={endSession}
              disabled={isProcessingSummary}
            >
              <span className={`material-symbols-outlined text-[20px] ${isProcessingSummary ? 'animate-spin' : ''}`}>
                {isProcessingSummary ? "autorenew" : "stop_circle"}
              </span>
              <span className="font-label-md text-label-md hidden md:block">
                {isProcessingSummary ? "Resumiendo..." : "Terminar Sesión"}
              </span>
            </button>
            <button className="glass-button px-6 h-12 flex items-center gap-3 rounded-full border-primary/20 text-primary hover:bg-primary/5 transition-colors" onClick={() => navigate('/sos')}>
              <span className="material-symbols-outlined text-[20px] text-error" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
              <span className="font-label-md text-label-md">S.O.S.</span>
            </button>
          </div>
        </header>

        {/* Content Area Container */}
        <div className="flex-1 relative flex flex-col items-center justify-center">

          {/* Voice Mode Container */}
          <main
            className={`mode-transition flex flex-col items-center justify-center w-full absolute inset-0 ${isTextMode ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
              }`}
          >
            <div
              className="orb-container cursor-pointer transition-transform hover:scale-105 active:scale-95"
              onClick={toggleListening}
              title="Click para hablar/detener"
            >
              <div ref={glowRef} className={`vibrating-orb ${isListening ? 'bg-primary/40 scale-110' : ''}`}></div>
              <div className={`orb-ring ${isListening ? 'border-primary/60 scale-105' : ''}`}></div>
              <div ref={orbRef} className={`orb-inner flex items-center justify-center ${isListening ? 'shadow-[0_0_30px_rgba(233,165,165,0.6)]' : ''}`}>
                <div className={`w-3 h-3 rounded-full animate-ping ${isListening ? 'bg-primary/60 scale-150' : 'bg-primary/20'}`}></div>
              </div>
            </div>

            <div className="mt-16 max-w-lg text-center px-4">
              <p
                className="font-body-lg text-body-lg-mobile md:text-body-lg text-neutral-custom/60 italic leading-relaxed transition-opacity duration-1000 min-h-[60px]"
                style={{ opacity: transcriptionOpacity }}
              >
                "{currentTranscript || (isListening ? 'Escuchando...' : 'Toca el orbe para hablar')}"
              </p>
            </div>
          </main>

          {/* Text Mode Container */}
          <main
            className={`mode-transition flex flex-col w-full h-full max-w-2xl mx-auto absolute inset-0 ${isTextMode ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-10'
              }`}
          >
            {/* Mini Orb */}
            <div className="flex justify-center mb-4 shrink-0">
              <div className="w-16 h-16 relative">
                <div className="vibrating-orb opacity-40"></div>
                <div className="orb-inner flex items-center justify-center !w-full !h-full">
                  <div className="w-1.5 h-1.5 bg-primary/20 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto chat-scroll px-4 pb-4 space-y-6">
              {messages.map((msg, index) => (
                <div key={index} className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end ml-auto' : 'items-start'}`}>
                  <div className={`${msg.role === 'user'
                      ? 'bg-primary/10 border border-primary/20 px-6 py-4 rounded-2xl rounded-tr-none text-body-md text-on-surface'
                      : 'glass-button px-6 py-4 rounded-2xl rounded-tl-none text-body-md text-on-surface-variant'
                    }`}>
                    {msg.text}
                  </div>
                  <span className={`text-label-sm text-neutral-custom/40 mt-2 ${msg.role === 'user' ? 'mr-1' : 'ml-1'}`}>
                    {msg.role === 'user' ? 'Tú' : 'AISE'}
                  </span>
                </div>
              ))}
            </div>
          </main>
        </div>

        {/* Footer Area */}
        <footer className="mt-8 flex flex-col items-center gap-6 shrink-0 pb-24 md:pb-4">

          {/* Text Mode Input Container */}
          <div
            className={`w-full max-w-2xl flex items-center gap-3 transition-all duration-500 overflow-hidden ${isTextMode ? 'opacity-100 translate-y-0 h-14' : 'opacity-0 pointer-events-none translate-y-10 h-0 m-0'
              }`}
          >
            <div className="relative flex-1">
              <input
                className="w-full h-14 pl-6 pr-12 rounded-full border border-primary/20 bg-white/50 backdrop-blur-md focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:outline-none text-on-surface placeholder-neutral-custom/40 transition-all"
                placeholder="Escribe aquí tu mensaje..."
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isListening ? 'text-primary animate-pulse' : 'text-primary/60 hover:text-primary'}`}
                onClick={toggleListening}
                title={isListening ? "Detener grabación" : "Hablar por micrófono"}
              >
                <span className="material-symbols-outlined">mic</span>
              </button>
            </div>
            <button
              className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              onClick={handleSendText}
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>

          {/* Mode Toggle Button */}
          <button
            onClick={() => { initTTS(); toggleMode(); }}
            className={`glass-button items-center gap-3 px-8 py-4 rounded-full text-primary font-label-md text-label-md group hover:bg-primary/5 ${isTextMode ? 'hidden md:flex' : 'flex'}`}
          >
            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">
              {isTextMode ? 'graphic_eq' : 'keyboard'}
            </span>
            <span>{isTextMode ? 'MODO VOZ' : 'MODO TEXTO'}</span>
          </button>
        </footer>
      </div>

      {/* Decorative Corner Elements */}
      <div className="fixed top-0 right-0 p-8 pointer-events-none opacity-20">
        <div className="w-32 h-32 border-t border-r border-outline-variant rounded-tr-3xl"></div>
      </div>
      <div className="fixed bottom-0 left-0 p-8 pointer-events-none opacity-20">
        <div className="w-32 h-32 border-b border-l border-outline-variant rounded-bl-3xl"></div>
      </div>

      {/* Navbar Inferior (Solo Móvil) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-primary/10 z-[50] flex justify-around items-center h-16 px-2 pb-safe">
        {SIDEBAR_LINKS.map((link) => (
          <button
            key={link.label}
            onClick={() => navigate(link.route)}
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 ${link.active ? "text-primary" : "text-on-surface-variant hover:text-primary transition-colors"
              }`}
          >
            <div
              className={`w-12 h-8 flex items-center justify-center rounded-full ${link.active ? "bg-primary-container" : ""
                }`}
            >
              <span className="material-icons-outlined text-[24px]">
                {link.icon}
              </span>
            </div>
            <span className="text-[10px] font-medium tracking-wide text-center px-1 truncate w-full">
              {link.mobileLabel || link.label}
            </span>
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
};

export default VoiceInterface;