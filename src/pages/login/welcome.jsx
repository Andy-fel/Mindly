import React, { useState } from "react";
import "../login/welcome_style.css";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const [currentView, setCurrentView] = useState("welcome");
  const [isStarting, setIsStarting] = useState(false);
  const navigate = useNavigate();

  const showTestIntro = (event) => {
    event?.preventDefault();
    setCurrentView("hidden");
    window.setTimeout(() => setCurrentView("test"), 200);
  };

  const showWelcome = (event) => {
    event?.preventDefault();
    setCurrentView("hidden");
    window.setTimeout(() => setCurrentView("welcome"), 200);
  };

  const handleStartTest = () => {
    if (isStarting) return;
    setIsStarting(true);
    navigate("/test");
  };

  

  return (
    <div className="mindly-app h-full bg-white text-[#2D3748] font-sans antialiased selection:bg-[#E8A5CD]/20 selection:text-[#2D3748] relative flex flex-col justify-between overflow-x-hidden min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-[#E8A5CD]/25 to-transparent blur-3xl animate-pulse-glow"></div>
        <div className="absolute -top-20 -right-24 w-[28rem] h-[28rem] rounded-full bg-gradient-to-bl from-[#7BE0E8]/20 to-transparent blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }}></div>
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[38rem] h-[38rem] rounded-full bg-gradient-to-t from-[#E8A5CD]/15 via-[#7BE0E8]/10 to-transparent blur-3xl"></div>
      </div><main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full">
        {/* ========================================== */}
        {/* VIEW 1: WELCOME SCREEN (Active by default) */}
        {/* ========================================== */}
        <section className={`view-transition w-full flex flex-col items-center text-center ${currentView === "welcome" ? "view-visible" : "view-hidden"}`} id="view-welcome">
          {/* Safe Space Illustration / Glowing AI Orb Graphic */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 mb-8 flex items-center justify-center animate-float">
            {/* Ambient pulsating aura rings */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#E8A5CD]/30 via-[#7BE0E8]/25 to-transparent blur-2xl animate-ring"></div>
            <div className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-[#E8A5CD]/30 bg-gradient-to-b from-white/90 to-[#FAF9FB]/70 backdrop-blur-sm shadow-soft flex items-center justify-center">
              {/* Inner SVG Graphic: Lotus + AI Voice Resonance + Heart */}
              <svg className="w-36 h-36 drop-shadow-md" fill="none" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient gradientUnits="userSpaceOnUse" id="orbGradient" x1="20" x2="140" y1="20" y2="140">
                    <stop offset="0%" stopColor="#FFD4E7"></stop>
                    <stop offset="45%" stopColor="#E8A5CD"></stop>
                    <stop offset="100%" stopColor="#7BE0E8"></stop>
                  </linearGradient>
                  <linearGradient id="waveG" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#7BE0E8"></stop>
                    <stop offset="50%" stopColor="#E8A5CD"></stop>
                    <stop offset="100%" stopColor="#7BE0E8"></stop>
                  </linearGradient>
                  <filter height="140%" id="bloom" width="140%" x="-20%" y="-20%">
                    <feDropShadow dx="0" dy="8" floodColor="#E8A5CD" floodOpacity="0.35" stdDeviation="10"></feDropShadow>
                  </filter>
                </defs>
                {/* Calming Base Ripples */}
                <ellipse cx="80" cy="118" fill="#7BE0E8" fillOpacity="0.2" rx="46" ry="14"></ellipse>
                <ellipse cx="80" cy="116" fill="#E8A5CD" fillOpacity="0.25" rx="34" ry="9"></ellipse>
                {/* Center Heart Silhouette & Safe Lotus */}
                <g filter="url(#bloom)">
                  <path d="M80 114 C52 92 34 72 34 52 C34 35 46 22 62 22 C72 22 77 27 80 32 C83 27 88 22 98 22 C114 22 126 35 126 52 C126 72 108 92 80 114 Z" fill="url(#orbGradient)"></path>
                </g>
                {/* Warm Lotus Petals / Caring embrace inside heart */}
                <path d="M64 68 C70 76 76 78 80 78 C84 78 90 76 96 68" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="3.5"></path>
                {/* Gentle Audio Waves (A.I.S.E. listening) */}
                <g opacity="0.95" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="2.5">
                  <line x1="80" x2="80" y1="88" y2="100"></line>
                  <line x1="72" x2="72" y1="90" y2="98"></line>
                  <line x1="88" x2="88" y1="90" y2="98"></line>
                  <line x1="65" x2="65" y1="92" y2="96"></line>
                  <line x1="95" x2="95" y1="92" y2="96"></line>
                </g>
                {/* Calm Sparkles */}
                <circle cx="122" cy="38" fill="#7BE0E8" r="2.5"></circle>
                <circle cx="38" cy="46" fill="#E8A5CD" r="2"></circle>
                <path d="M128 30 Q131 34 135 35 Q131 36 128 40 Q127 36 123 35 Q127 34 128 30 Z" fill="#7BE0E8"></path>
              </svg>
            </div>
            {/* Floating subtle badges around the sanctuary orb */}
            <div className="absolute -left-2 top-10 px-3 py-1 bg-white/90 backdrop-blur-md border border-gray-100 rounded-full shadow-sm text-[11px] font-semibold text-[#7D7578] flex items-center gap-1.5 animate-float">
              <span className="text-[#7BE0E8]">✦</span> Espacio Seguro
            </div>
            <div className="absolute -right-2 bottom-12 px-3 py-1 bg-white/90 backdrop-blur-md border border-gray-100 rounded-full shadow-sm text-[11px] font-semibold text-[#7D7578] flex items-center gap-1.5 animate-float">
              <span className="text-[#E8A5CD]">♥</span> Sin Juicios
            </div>
          </div>
          {/* Typography Header */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-rose-50 to-cyan-50 border border-rose-100/60 text-[#7D7578] text-xs font-semibold">
              <span className="text-[#d48bb5]">Acompañamiento Inteligente</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>Basado en Evidencia</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#2D3748] leading-[1.18]">
              Bienvenido a tu <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#d48bb5] via-[#a890b5] to-[#5ecad3] bg-clip-text text-transparent">
                santuario digital
              </span>
            </h1>
          </div>
          {/* Action Area */}
          <div className="mt-9 flex flex-col items-center gap-3 w-full max-w-xs">
            <button className="btn-press group w-full py-4 px-8 rounded-full bg-[#E8A5CD] hover:bg-[#d48bb5] text-white font-bold text-sm tracking-wider uppercase shadow-btn-3d transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-[#E8A5CD]/30" id="btn-to-view-2" type="button" onClick={showTestIntro}>
              <span>CONTINUAR</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
            <span className="text-xs text-[#7D7578]/80 flex items-center gap-1.5 mt-1 font-medium">
              <svg className="w-3.5 h-3.5 text-[#7BE0E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              100% privado y confidencial
            </span>
          </div>
        </section>
        {/* ============================================== */}
        {/* VIEW 2: TEST INTRODUCTION (Hidden by default) */}
        {/* ============================================== */}
        <section className={`view-transition w-full max-w-xl mx-auto ${currentView === "test" ? "view-visible" : "view-hidden"}`} id="view-test-intro">
          {/* Card Container */}
          <div className="relative bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-card-elevated backdrop-blur-md">
            {/* Header Badge & Step Indicator */}
            {/* Heading & Body Description */}
            <div className="space-y-3 mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D3748] tracking-tight leading-snug">
                Comencemos con un breve test emocional
              </h2>
            </div>
            {/* Feature Points with clean iconography */}
            <div className="space-y-3.5 mb-8">
              {/* Item 1 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#FAF9FB] border border-gray-100/80 transition-colors hover:bg-rose-50/40">
                <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-gray-100 flex items-center justify-center shrink-0 text-base">
                  🔒
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D3748]">100% Confidencial y privado</h3>
                  <p className="text-xs text-[#7D7578] mt-0.5">Tus respuestas están cifradas y bajo estrictos protocolos de protección clínica.</p>
                </div>
              </div>
              {/* Item 2 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#FAF9FB] border border-gray-100/80 transition-colors hover:bg-cyan-50/40">
                <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-gray-100 flex items-center justify-center shrink-0 text-base">
                  ⏱️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D3748]">Rápido y sin juicios</h3>
                  <p className="text-xs text-[#7D7578] mt-0.5">Preguntas intuitivas para calibrar tu ritmo emocional sin respuestas incorrectas.</p>
                </div>
              </div>
              {/* Item 3 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#FAF9FB] border border-gray-100/80 transition-colors hover:bg-purple-50/40">
                <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-gray-100 flex items-center justify-center shrink-0 text-base">
                  💡
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D3748]">Resultados adaptados a ti</h3>
                  <p className="text-xs text-[#7D7578] mt-0.5">Permite a A.I.S.E. modular su tono reflexivo y activar tus herramientas clave.</p>
                </div>
              </div>
            </div>
            {/* Action Area (Side-by-side buttons) */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
              {/* Secondary Button: VOLVER */}
              <button className="btn-press w-full sm:w-1/3 py-3.5 px-5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-[#7D7578] hover:text-[#2D3748] font-bold text-xs tracking-wider uppercase shadow-btn-3d-white transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-300" id="btn-to-view-1" type="button" onClick={showWelcome}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span>VOLVER</span>
              </button>
              {/* Primary Button: COMENZAR TEST */}
              <button className={`btn-press group w-full sm:w-2/3 py-3.5 px-6 rounded-full bg-[#7BE0E8] hover:bg-[#5ecad3] text-[#2D3748] font-extrabold text-xs tracking-wider uppercase shadow-btn-3d-cyan transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-[#7BE0E8]/40 ${isStarting ? "opacity-80 cursor-not-allowed" : ""}`} id="btn-start-test" type="button" disabled={isStarting} onClick={handleStartTest}>
                {isStarting ? <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#2D3748]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg><span>CARGANDO EVALUACIÓN...</span></> : <>
                  <span>COMENZAR TEST</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </>}
              </button>
            </div>
            {/* Success Toast Notification (Simulated test trigger) */}
            <div className={`${isStarting ? "" : "hidden"} mt-4 p-3 rounded-2xl bg-cyan-50 border border-cyan-200 text-center text-xs font-semibold text-[#2D3748] animate-bounce`} id="test-started-feedback">
              ✨ Iniciando test psicométrico TCC... Redirigiendo a tu espacio seguro.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
