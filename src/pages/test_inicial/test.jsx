import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import {
  getStoredQuestions,
  saveStoredQuestions,
  resetStoredQuestions,
  DEFAULT_TRIAGE_QUESTIONS,
  calculateTriageAnalysis,
  saveUserTriageMetadata,
  getUserTriageMetadata
} from "../../backend/TriageService";
import "./test_style.css";

const SIDEBAR_LINKS = [
  { icon: "bubble_chart", label: "Chat con A.I.S.E", mobileLabel: "Chat", route: "/chat" },
  { icon: "assignment", label: "Evaluación Inicial", mobileLabel: "Test", route: "/test", active: true },
  { icon: "psychology", label: "Perfil Clínico (Triage)", mobileLabel: "Triage", route: "/triage" },
  { icon: "emergency", label: "Panel de Emergencia", mobileLabel: "Emergencia", route: "/sos" },
  { icon: "history", label: "Historial de Sesiones", mobileLabel: "Historial", route: "/historial" },
  { icon: "person", label: "Perfil y Ajustes", mobileLabel: "Perfil", route: "/configuracion" },
];

export default function InitialEvaluationTest() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Preguntas dinámicas y respuestas
  const [questions, setQuestions] = useState(DEFAULT_TRIAGE_QUESTIONS);
  const [answers, setAnswers] = useState({});
  const [activeAxis, setActiveAxis] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Alerta Centinela activa en tiempo real
  const [sentinelTriggered, setSentinelTriggered] = useState(false);

  // Modal para Añadir / Editar / Eliminar Preguntas
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestionForm, setNewQuestionForm] = useState({
    axisId: 1,
    axisTitle: "Eje 1: Estilo de Comunicación Deseado",
    question: "",
    options: [
      { id: "A", text: "" },
      { id: "B", text: "" },
      { id: "C", text: "" },
      { id: "D", text: "" }
    ],
    isSentinel: false
  });

  // Carga inicial de usuario y preguntas guardadas
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const existingData = await getUserTriageMetadata(currentUser.email || currentUser.uid);
        if (existingData?.answers) {
          setAnswers(existingData.answers);
        }
      }
    });

    const storedQs = getStoredQuestions();
    setQuestions(storedQs);

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

  // Manejo de selección de respuesta
  const handleSelectOption = (questionId, optionId, isTrigger = false) => {
    const updated = { ...answers, [questionId]: optionId };
    setAnswers(updated);

    // Revisar si dispara bandera centinela
    if (isTrigger || (questionId === "eje4_q3" && optionId === "C")) {
      setSentinelTriggered(true);
    } else if (questionId === "eje4_q3" && optionId !== "C") {
      setSentinelTriggered(false);
    }
  };

  // Agrupación de preguntas por Eje
  const axes = [
    { id: 1, title: "Eje 1: Estilo de Comunicación", icon: "forum", description: "Configura la manera en que prefieres que la IA y la voz se adapten a ti." },
    { id: 2, title: "Eje 2: Síntomas y Desencadenantes", icon: "vital_signs", description: "Identifica tus motivos de consulta y el impacto emocional actual." },
    { id: 3, title: "Eje 3: Recursos y Afrontamiento", icon: "shield", description: "Tus fortalezas personales, redes de apoyo y herramientas predilectas." },
    { id: 4, title: "Eje 4: Indicadores y Seguridad", icon: "security", description: "Filtro centinela preventivo, motivación y antecedentes terapéuticos." }
  ];

  const currentAxisQuestions = questions.filter((q) => q.axisId === activeAxis);

  // Cálculo de progreso global
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Finalizar y enviar a Triage
  const handleCompleteTest = async () => {
    setIsSaving(true);
    try {
      const triageResult = calculateTriageAnalysis(answers, questions);
      const userId = user ? user.email || user.uid : "guest_user";
      await saveUserTriageMetadata(userId, triageResult);
      navigate("/triage");
    } catch (error) {
      console.error("Error al procesar evaluación:", error);
      alert("Hubo un detalle al guardar la evaluación. Redirigiendo al Triage...");
      navigate("/triage");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── LÓGICA DE CRUD DE PREGUNTAS ──────────────────────────────────────────

  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setNewQuestionForm({
      axisId: activeAxis,
      axisTitle: axes.find((a) => a.id === activeAxis)?.title || "Eje Personalizado",
      question: "",
      options: [
        { id: "A", text: "" },
        { id: "B", text: "" },
        { id: "C", text: "" },
        { id: "D", text: "" }
      ],
      isSentinel: false
    });
    setIsManageModalOpen(true);
  };

  const handleOpenEditQuestion = (q) => {
    setEditingQuestion(q.id);
    setNewQuestionForm({
      axisId: q.axisId,
      axisTitle: q.axisTitle || "",
      question: q.question,
      options: q.options.map((opt) => ({ ...opt })),
      isSentinel: !!q.isSentinel
    });
    setIsManageModalOpen(true);
  };

  const handleDeleteQuestion = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta pregunta del test?")) {
      const filtered = questions.filter((q) => q.id !== id);
      setQuestions(filtered);
      saveStoredQuestions(filtered);
      const newAnswers = { ...answers };
      delete newAnswers[id];
      setAnswers(newAnswers);
    }
  };

  const handleResetDefaultQuestions = () => {
    if (window.confirm("¿Deseas restaurar las preguntas originales de los 4 ejes clínicos?")) {
      const defaults = resetStoredQuestions();
      setQuestions(defaults);
      setIsManageModalOpen(false);
    }
  };

  const handleSaveQuestionForm = (e) => {
    e.preventDefault();
    if (!newQuestionForm.question.trim()) {
      alert("Por favor ingresa el enunciado de la pregunta.");
      return;
    }

    const validOptions = newQuestionForm.options
      .filter((opt) => opt.text.trim())
      .map((opt, idx) => ({
        id: String.fromCharCode(65 + idx),
        text: opt.text.trim(),
        value: opt.text.trim()
      }));

    if (validOptions.length < 2) {
      alert("Por favor ingresa al menos 2 opciones de respuesta.");
      return;
    }

    let updatedQuestions;
    if (editingQuestion) {
      updatedQuestions = questions.map((q) => {
        if (q.id === editingQuestion) {
          return {
            ...q,
            axisId: Number(newQuestionForm.axisId),
            axisTitle: axes.find((a) => a.id === Number(newQuestionForm.axisId))?.title || q.axisTitle,
            question: newQuestionForm.question.trim(),
            options: validOptions,
            isSentinel: newQuestionForm.isSentinel
          };
        }
        return q;
      });
    } else {
      const newId = `custom_q_${Date.now()}`;
      const newQ = {
        id: newId,
        axisId: Number(newQuestionForm.axisId),
        axisTitle: axes.find((a) => a.id === Number(newQuestionForm.axisId))?.title || "Eje Clínico",
        question: newQuestionForm.question.trim(),
        options: validOptions,
        isSentinel: newQuestionForm.isSentinel
      };
      updatedQuestions = [...questions, newQ];
    }

    setQuestions(updatedQuestions);
    saveStoredQuestions(updatedQuestions);
    setIsManageModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fff8f9] text-[#2D2A2E] font-['Montserrat'] relative overflow-x-hidden">
      {/* Fondo Aurora característico de Mindly */}
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

      {/* ── Header Principal ── */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-[#E8A5CD]/20 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-700 focus:outline-none"
            aria-label="Abrir menú lateral"
          >
            <span className="material-symbols-outlined block">menu</span>
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>Evaluación Inicial</span>
              <span className="hidden md:inline-block text-xs bg-[#7BE0E8]/30 text-teal-800 font-semibold px-2.5 py-0.5 rounded-full">
                Triage & Personalidad
              </span>
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Mapeo interactivo para adaptar A.I.S.E. a tu estilo personal
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3">
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E8A5CD]/40 text-[#9C3877] hover:bg-[#E8A5CD]/10 shadow-sm transition-all"
            title="Añadir, editar o eliminar preguntas"
          >
            <span className="material-symbols-outlined text-base">tune</span>
            <span className="hidden sm:inline">Gestionar Preguntas</span>
          </button>

          <button
            onClick={() => navigate("/triage")}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#7BE0E8]/30 text-teal-900 hover:bg-[#7BE0E8]/50 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-base">clinical_notes</span>
            <span>Ver Triage</span>
          </button>
        </div>
      </header>

      {/* ── Contenido Principal ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 z-10 flex flex-col gap-6">
        
        {/* Banner Filtro Centinela de Emergencia (Si se dispara) */}
        {sentinelTriggered && (
          <div className="sentinel-alert-box rounded-2xl p-5 md:p-6 border-l-4 border-l-red-500 text-red-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pulse-emergency">
            <div className="flex items-start space-x-3.5">
              <span className="material-symbols-outlined text-3xl text-red-600 flex-shrink-0 mt-0.5">
                emergency
              </span>
              <div>
                <h3 className="font-bold text-base text-red-900">
                  Filtro Centinela: Tu seguridad es lo más importante
                </h3>
                <p className="text-xs md:text-sm text-red-800 mt-1 leading-relaxed">
                  Has indicado pensamientos difíciles de sobrellevar. No estás solo/a en este momento. Mindly y A.I.S.E. están para acompañarte, pero si sientes riesgo de hacerte daño, te invitamos a acudir de inmediato a soporte humano especializado.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-stretch md:self-auto flex-shrink-0">
              <button
                onClick={() => navigate("/sos")}
                className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">crisis_alert</span>
                Ir al Panel SOS
              </button>
            </div>
          </div>
        )}

        {/* Barra de Progreso y Navegación de Ejes */}
        <div className="triage-gradient-card rounded-3xl p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[11px] font-bold text-[#9C3877] uppercase tracking-wider">
                Psicometría Adaptativa
              </span>
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                {axes.find((a) => a.id === activeAxis)?.title}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {axes.find((a) => a.id === activeAxis)?.description}
              </p>
            </div>
            <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
              <span className="text-xs font-semibold text-gray-500">
                Respondidas: {answeredCount} de {totalQuestions}
              </span>
              <span className="text-sm font-extrabold text-[#9C3877]">
                {progressPercent}% completado
              </span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#E8A5CD] to-[#7BE0E8] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Selector de Ejes Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
            {axes.map((axis) => {
              const axisQs = questions.filter((q) => q.axisId === axis.id);
              const axisAnswered = axisQs.filter((q) => answers[q.id]);
              const isComplete = axisQs.length > 0 && axisAnswered.length === axisQs.length;
              const isActive = activeAxis === axis.id;

              return (
                <button
                  key={axis.id}
                  onClick={() => setActiveAxis(axis.id)}
                  className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                    isActive
                      ? "border-[#E8A5CD] bg-white shadow-sm ring-2 ring-[#E8A5CD]/30"
                      : "border-transparent bg-white/50 hover:bg-white/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`material-symbols-outlined text-lg ${
                        isActive ? "text-[#9C3877]" : "text-gray-400"
                      }`}
                    >
                      {axis.icon}
                    </span>
                    {isComplete ? (
                      <span className="material-symbols-outlined text-sm text-emerald-500 font-bold">
                        check_circle
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400">
                        {axisAnswered.length}/{axisQs.length}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold leading-tight line-clamp-1 ${
                      isActive ? "text-gray-900 font-bold" : "text-gray-600"
                    }`}
                  >
                    Eje {axis.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de Preguntas del Eje Activo */}
        <div className="space-y-6">
          {currentAxisQuestions.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-gray-300">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">quiz</span>
              <p className="text-sm font-semibold text-gray-600">
                No hay preguntas configuradas en este eje aún.
              </p>
              <button
                onClick={handleOpenAddQuestion}
                className="mt-3 px-4 py-2 rounded-xl bg-[#E8A5CD] text-white font-bold text-xs shadow-sm hover:opacity-90"
              >
                + Añadir Pregunta al Eje {activeAxis}
              </button>
            </div>
          ) : (
            currentAxisQuestions.map((q, idx) => {
              const selectedOptionId = answers[q.id];

              return (
                <div
                  key={q.id}
                  className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-7 shadow-sm border border-[#E8A5CD]/20 transition-all hover:border-[#E8A5CD]/40"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start space-x-3">
                      <span className="w-7 h-7 rounded-full bg-[#E8A5CD]/20 text-[#9C3877] font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="font-bold text-base md:text-lg text-gray-900 leading-snug">
                          {q.question}
                        </h3>
                        {q.isSentinel && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full mt-1.5 uppercase">
                            <span className="material-symbols-outlined text-xs">shield</span>
                            Filtro Centinela de Seguridad
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        className="p-1.5 text-gray-400 hover:text-[#9C3877] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar pregunta"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar pregunta"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Opciones de Respuesta */}
                  <div className="grid grid-cols-1 gap-2.5 mt-3">
                    {q.options.map((opt) => {
                      const isSelected = selectedOptionId === opt.id || selectedOptionId === opt.value;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(q.id, opt.id, !!opt.isTrigger)}
                          className={`triage-option-card w-full text-left p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                            isSelected
                              ? "selected border-[#E8A5CD] bg-[#E8A5CD]/10 text-gray-900 font-semibold"
                              : "border-gray-200 bg-white/70 text-gray-700 hover:border-[#E8A5CD]/40 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                isSelected
                                  ? "bg-[#E8A5CD] text-white"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {opt.id}
                            </span>
                            <span className="text-xs md:text-sm leading-relaxed">{opt.text}</span>
                          </div>
                          {isSelected && (
                            <span className="material-symbols-outlined text-[#9C3877] text-lg font-bold flex-shrink-0">
                              check_circle
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Barra de Controles Inferiores */}
        <div className="sticky bottom-4 z-30 triage-gradient-card rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <button
            type="button"
            disabled={activeAxis <= 1}
            onClick={() => setActiveAxis((prev) => Math.max(1, prev - 1))}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeAxis <= 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-700 hover:bg-white/80 active:scale-95"
            }`}
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Eje Anterior</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenAddQuestion}
              className="hidden sm:flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold bg-white text-gray-600 hover:text-gray-900 border border-gray-200 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Añadir Pregunta</span>
            </button>

            {activeAxis < 4 ? (
              <button
                type="button"
                onClick={() => setActiveAxis((prev) => Math.min(4, prev + 1))}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#E8A5CD] text-white hover:opacity-90 shadow-md transition-all active:scale-95"
              >
                <span>Siguiente Eje</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleCompleteTest}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#E8A5CD] to-[#7BE0E8] text-[#2D2A2E] hover:opacity-95 shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">verified</span>
                <span>{isSaving ? "Guardando Triage..." : "Finalizar y Ver Perfil"}</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* ── Modal para Añadir / Editar Preguntas ── */}
      {isManageModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-[#E8A5CD]/30 my-8">
            <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[#E8A5CD] text-2xl">
                  {editingQuestion ? "edit_note" : "playlist_add"}
                </span>
                <h3 className="font-bold text-lg text-gray-900">
                  {editingQuestion ? "Editar Pregunta" : "Añadir Nueva Pregunta"}
                </h3>
              </div>
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveQuestionForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Eje Clínico Correspondiente
                </label>
                <select
                  value={newQuestionForm.axisId}
                  onChange={(e) =>
                    setNewQuestionForm({ ...newQuestionForm, axisId: Number(e.target.value) })
                  }
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#E8A5CD] outline-none"
                >
                  <option value={1}>Eje 1: Estilo de Comunicación Deseado</option>
                  <option value={2}>Eje 2: Presentación de Síntomas y Desencadenantes</option>
                  <option value={3}>Eje 3: Recursos Personales y Afrontamiento</option>
                  <option value={4}>Eje 4: Indicadores Pronósticos y Banderas Rojas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Enunciado de la Pregunta
                </label>
                <textarea
                  rows={3}
                  value={newQuestionForm.question}
                  onChange={(e) =>
                    setNewQuestionForm({ ...newQuestionForm, question: e.target.value })
                  }
                  placeholder="Ej. ¿Cómo sueles reaccionar ante situaciones imprevistas?"
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#E8A5CD] outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Opciones de Respuesta
                </label>
                <div className="space-y-2">
                  {newQuestionForm.options.map((opt, i) => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {opt.id}
                      </span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const updatedOpts = [...newQuestionForm.options];
                          updatedOpts[i].text = e.target.value;
                          setNewQuestionForm({ ...newQuestionForm, options: updatedOpts });
                        }}
                        placeholder={`Opción ${opt.id}`}
                        className="flex-1 text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#E8A5CD] outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="sentinelCheck"
                  checked={newQuestionForm.isSentinel}
                  onChange={(e) =>
                    setNewQuestionForm({ ...newQuestionForm, isSentinel: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#E8A5CD] border-gray-300 focus:ring-[#E8A5CD]"
                />
                <label htmlFor="sentinelCheck" className="text-xs font-semibold text-gray-700">
                  Marcar como Pregunta Centinela (Seguridad/Riesgo)
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleResetDefaultQuestions}
                  className="text-xs text-red-500 hover:underline font-semibold"
                >
                  Restaurar Originales
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsManageModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#E8A5CD] text-white hover:opacity-90 shadow-sm"
                  >
                    Guardar Pregunta
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

