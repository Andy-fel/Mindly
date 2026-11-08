import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import {
  getUserTriageMetadata,
  saveUserTriageMetadata,
  calculateTriageAnalysis
} from "../../backend/TriageService";
import "./test_style.css";

const SIDEBAR_LINKS = [
  { icon: "bubble_chart", label: "Chat con A.I.S.E", mobileLabel: "Chat", route: "/chat" },
  { icon: "assignment", label: "Evaluación Inicial", mobileLabel: "Test", route: "/test" },
  { icon: "psychology", label: "Perfil Clínico (Triage)", mobileLabel: "Triage", route: "/triage", active: true },
  { icon: "emergency", label: "Panel de Emergencia", mobileLabel: "Emergencia", route: "/sos" },
  { icon: "history", label: "Historial de Sesiones", mobileLabel: "Historial", route: "/historial" },
  { icon: "person", label: "Perfil y Ajustes", mobileLabel: "Perfil", route: "/configuracion" },
];

export default function ClinicalTriageProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [triageData, setTriageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsLoading(true);
      const userId = currentUser ? currentUser.email || currentUser.uid : null;
      let data = await getUserTriageMetadata(userId);

      // Si no existe, crear análisis de ejemplo predeterminado
      if (!data) {
        data = calculateTriageAnalysis({});
      }
      setTriageData(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  const handleForceSync = async () => {
    if (!triageData) return;
    setIsSyncing(true);
    const userId = user ? user.email || user.uid : "guest_user";
    await saveUserTriageMetadata(userId, triageData);
    setIsSyncing(false);
    alert("¡Expediente RAG sincronizado exitosamente en Firestore (users_metadata)!");
  };

  const handleCopyPrompt = () => {
    if (triageData?.aiSystemPromptExtension) {
      navigator.clipboard.writeText(triageData.aiSystemPromptExtension);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff8f9]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#E8A5CD] border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-gray-600">Cargando expediente clínico...</p>
        </div>
      </div>
    );
  }

  const {
    completedAt,
    riskLevel,
    riskBadgeColor,
    isSentinelTriggered,
    clinicalRiskDescription,
    prognosticMatrix,
    personalityTraits,
    aiSystemPromptExtension
  } = triageData || {};

  return (
    <div className="flex flex-col min-h-screen bg-[#fff8f9] text-[#2D2A2E] font-['Montserrat'] relative overflow-x-hidden">
      {/* Fondo Aurora */}
      <div className="aurora-bg"></div>

      {/* ── Sidebar Overlay ── */}
      <div
        className={`fixed inset-0 bg-black/25 backdrop-blur-sm z-[70] transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* ── Sidebar Drawer ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white/95 backdrop-blur-md z-[80] shadow-2xl border-r border-[#E8A5CD]/20 flex flex-col transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-[#E8A5CD]/20">
          <div className="flex items-center space-x-3">
            <span className="material-symbols-outlined text-3xl text-[#E8A5CD]">psychology</span>
            <span className="font-bold text-xl tracking-tight text-[#2D2A2E]">Mindly</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {SIDEBAR_LINKS.map((link) => (
            <button
              key={link.route}
              onClick={() => {
                setIsSidebarOpen(false);
                navigate(link.route);
              }}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                link.active
                  ? "bg-[#E8A5CD]/20 text-[#9C3877] shadow-sm font-bold"
                  : "text-gray-600 hover:bg-[#7BE0E8]/10 hover:text-gray-900"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{link.icon}</span>
              <span>{link.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#E8A5CD]/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#E8A5CD]/30 text-[#9C3877] font-bold flex items-center justify-center text-sm shadow-inner">
              {user?.email ? user.email.slice(0, 2).toUpperCase() : "MD"}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-gray-800 truncate max-w-[120px]">
                {user?.displayName || (user?.email ? user.email.split("@")[0] : "Paciente")}
              </span>
              <span className="text-[10px] text-gray-400">En línea</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </aside>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-[#E8A5CD]/20 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-700"
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined block">menu</span>
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>Perfil Psicológico</span>
              <span className="text-xs bg-[#E8A5CD]/20 text-[#9C3877] font-bold px-2.5 py-0.5 rounded-full">
                Triage Clinical
              </span>
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Expediente integrado para la personalización de A.I.S.E.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3">
          <button
            onClick={() => navigate("/test")}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            <span className="hidden sm:inline">Actualizar Evaluación</span>
          </button>

          <button
            onClick={() => navigate("/chat")}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E8A5CD] text-white hover:opacity-90 shadow-md transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">bubble_chart</span>
            <span>Hablar con A.I.S.E</span>
          </button>
        </div>
      </header>

      {/* ── Contenido ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 z-10 space-y-6">

        {/* 1. Alerta Centinela o Banner de Riesgo Global */}
        <div
          className={`rounded-3xl p-6 md:p-7 shadow-sm border flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
            isSentinelTriggered
              ? "bg-red-50/90 border-red-300 text-red-950 pulse-emergency"
              : riskBadgeColor === "amber"
              ? "bg-amber-50/90 border-amber-200 text-amber-950"
              : "bg-emerald-50/90 border-emerald-200 text-emerald-950"
          }`}
        >
          <div className="flex items-start space-x-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                isSentinelTriggered
                  ? "bg-red-600 text-white"
                  : riskBadgeColor === "amber"
                  ? "bg-amber-500 text-white"
                  : "bg-emerald-600 text-white"
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {isSentinelTriggered ? "crisis_alert" : riskBadgeColor === "amber" ? "warning" : "verified_user"}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Nivel de Riesgo Clínico
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    isSentinelTriggered
                      ? "bg-red-200 text-red-900"
                      : riskBadgeColor === "amber"
                      ? "bg-amber-200 text-amber-900"
                      : "bg-emerald-200 text-emerald-900"
                  }`}
                >
                  {riskLevel}
                </span>
              </div>
              <h2 className="text-base md:text-lg font-bold mt-1">
                {isSentinelTriggered
                  ? "Alerta Preventiva Inmediata Activada"
                  : "Estado Clínico y Factores de Contención"}
              </h2>
              <p className="text-xs md:text-sm mt-1 leading-relaxed opacity-90 max-w-2xl">
                {clinicalRiskDescription}
              </p>
            </div>
          </div>

          {isSentinelTriggered ? (
            <button
              onClick={() => navigate("/sos")}
              className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 flex-shrink-0 self-stretch md:self-auto justify-center"
            >
              <span className="material-symbols-outlined text-lg">emergency</span>
              Activar Modo SOS
            </button>
          ) : (
            <div className="text-right flex-shrink-0 hidden md:block">
              <span className="text-[11px] text-gray-500 block">Evaluado el:</span>
              <span className="text-xs font-bold text-gray-800">
                {completedAt ? new Date(completedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "Hoy"}
              </span>
            </div>
          )}
        </div>

        {/* 2. Matriz de Indicadores Pronósticos (Grid) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#E8A5CD]">analytics</span>
              Matriz de Indicadores Pronósticos
            </h3>
            <span className="text-xs text-gray-400">Introspección · Motivación · Redes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Introspección */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 border border-[#E8A5CD]/20 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase">Introspección</span>
                  <span className="material-symbols-outlined text-[#9C3877]">self_improvement</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-extrabold text-[#9C3877]">
                    {prognosticMatrix?.introspection?.score || "Media"}
                  </span>
                  <span className="text-[11px] text-gray-400">Nivel de Insight</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {prognosticMatrix?.introspection?.description}
                </p>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-4">
                <div
                  className="bg-gradient-to-r from-[#E8A5CD] to-[#7BE0E8] h-full rounded-full"
                  style={{
                    width:
                      prognosticMatrix?.introspection?.score === "Alta"
                        ? "90%"
                        : prognosticMatrix?.introspection?.score === "Media"
                        ? "60%"
                        : "35%"
                  }}
                />
              </div>
            </div>

            {/* Motivación */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 border border-[#E8A5CD]/20 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase">Motivación al Cambio</span>
                  <span className="material-symbols-outlined text-teal-600">bolt</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xl font-extrabold text-teal-800">
                    {prognosticMatrix?.motivation?.score || "Moderada"}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {prognosticMatrix?.motivation?.description}
                </p>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-4">
                <div
                  className="bg-gradient-to-r from-[#7BE0E8] to-[#E8A5CD] h-full rounded-full"
                  style={{
                    width:
                      prognosticMatrix?.motivation?.score?.includes("Alta")
                        ? "90%"
                        : prognosticMatrix?.motivation?.score?.includes("Moderada")
                        ? "65%"
                        : "40%"
                  }}
                />
              </div>
            </div>

            {/* Redes de Apoyo */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 border border-[#E8A5CD]/20 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase">Red de Apoyo</span>
                  <span className="material-symbols-outlined text-purple-600">diversity_3</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xl font-extrabold text-purple-900">
                    {prognosticMatrix?.supportNetwork?.status || "Moderada"}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    ({prognosticMatrix?.supportNetwork?.protection || "Factor Protector"})
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {prognosticMatrix?.supportNetwork?.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Terapia previa:</span>
                <span className="font-bold text-gray-700">
                  {prognosticMatrix?.priorTherapy?.status || "No registrada"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Rasgos de Personalidad y Estilo IA Adaptativo */}
        <div className="triage-gradient-card rounded-3xl p-6 md:p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#E8A5CD]">tune</span>
                Rasgos y Estilo de Interacción Deseado
              </h3>
              <p className="text-xs text-gray-500">
                Parámetros calibrados para la respuesta verbal y empática de A.I.S.E.
              </p>
            </div>
            <button
              onClick={() => navigate("/test")}
              className="text-xs font-bold text-[#9C3877] hover:underline"
            >
              Editar en Test
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/70 p-4 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Estilo de Comunicación
              </span>
              <p className="text-sm font-bold text-gray-800">
                {personalityTraits?.communicationStyle || "Empático y reflexivo"}
              </p>
            </div>

            <div className="bg-white/70 p-4 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Tono de Voz AISE
              </span>
              <p className="text-sm font-bold text-gray-800">
                {personalityTraits?.voiceTone || "Cálido y pausado"}
              </p>
            </div>

            <div className="bg-white/70 p-4 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Afrontamiento Habitual
              </span>
              <p className="text-sm font-bold text-gray-800">
                {personalityTraits?.copingMechanism || "Distracción / Reflexión"}
              </p>
            </div>

            <div className="bg-white/70 p-4 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Herramientas Favoritas
              </span>
              <p className="text-sm font-bold text-gray-800">
                {personalityTraits?.preferredTools || "Respiración guiada"}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Integración con la IA (RAG) en users_metadata */}
        <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-[#E8A5CD]/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">database</span>
              </div>
              <div>
                <h4 className="font-bold text-sm md:text-base text-gray-900 flex items-center gap-2">
                  <span>Expediente RAG Activo (Firestore users_metadata)</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Sincronizado
                  </span>
                </h4>
                <p className="text-xs text-gray-500">
                  Este contexto es inyectado dinámicamente a A.I.S.E. para que adapte su personalidad en tiempo real.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyPrompt}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
              >
                <span className="material-symbols-outlined text-sm">
                  {copiedPrompt ? "check" : "content_copy"}
                </span>
                <span>{copiedPrompt ? "Copiado" : "Copiar"}</span>
              </button>

              <button
                onClick={handleForceSync}
                disabled={isSyncing}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#7BE0E8]/30 text-teal-900 hover:bg-[#7BE0E8]/50"
              >
                <span className="material-symbols-outlined text-sm">sync</span>
                <span>{isSyncing ? "Sincronizando..." : "Re-sincronizar"}</span>
              </button>
            </div>
          </div>

          {/* Caja con el prompt RAG generado */}
          <div className="bg-gray-900 text-gray-200 rounded-2xl p-4 font-mono text-xs overflow-x-auto leading-relaxed border border-gray-800">
            <pre className="whitespace-pre-wrap">{aiSystemPromptExtension}</pre>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-gray-500">
              Colección: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">users_metadata/{user ? user.email || user.uid : "local"}</code>
            </span>

            <button
              onClick={() => navigate("/chat")}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E8A5CD] to-[#7BE0E8] text-[#2D2A2E] font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">chat</span>
              Iniciar Sesión con A.I.S.E Adaptada
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}

