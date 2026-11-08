import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import LoginForm from "./pages/login/login.jsx";
import VoiceInterface from "./pages/chat/Chat.jsx";
import EmergencyMode from "./pages/s.o.s/canales_Atencion.jsx";
import MemoryLane from "./pages/historial/memory_Line.jsx";
import ProfileSettings from "./pages/configuracion/settings.jsx";
import InitialEvaluationTest from "./pages/test_inicial/test.jsx";
import ClinicalTriageProfile from "./pages/test_inicial/triage_clinico.jsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/chat" element={<VoiceInterface />} />
          <Route path="/historial" element={<MemoryLane />} />
          <Route path="/configuracion" element={<ProfileSettings />} />
          <Route path="/sos" element={<EmergencyMode />} />
          <Route path="/test" element={<InitialEvaluationTest />} />
          <Route path="/test-inicial" element={<InitialEvaluationTest />} />
          <Route path="/evaluacion" element={<InitialEvaluationTest />} />
          <Route path="/triage" element={<ClinicalTriageProfile />} />
          <Route path="/perfil-clinico" element={<ClinicalTriageProfile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Index />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
