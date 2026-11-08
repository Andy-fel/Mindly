import { GraduationCap, Brain, Stethoscope } from "lucide-react";

const audiences = [
  {
    icon: GraduationCap,
    title: "Comunidad UPC",
    description: "Estudiantes y docentes de la Universidad Popular del Cesar que buscan un espacio seguro para cuidar su bienestar emocional.",
  },
  {
    icon: Brain,
    title: "Estudiantes con estrés académico",
    description: "Jóvenes que enfrentan ansiedad, presión por exámenes o agotamiento y necesitan acompañamiento inmediato.",
  },
  {
    icon: Stethoscope,
    title: "Profesionales de salud mental",
    description: "Psicólogos y terapeutas que requieren un soporte tecnológico para el seguimiento continuo de sus pacientes.",
  },
];

const Audience = () => {
  return (
    <section id="audience" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-gradient uppercase tracking-wider">Para quién</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-4 mb-5 tracking-tight">
            Pensado para quienes lo necesitan
          </h2>
          <p className="text-muted-foreground text-lg">
            Una herramienta cercana, accesible y confiable para distintas comunidades.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {audiences.map((a) => (
            <div
              key={a.title}
              className="group glass rounded-3xl p-8 hover:shadow-soft transition-all duration-500 hover:-translate-y-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-5 shadow-soft group-hover:scale-110 transition-transform">
                <a.icon className="w-7 h-7 text-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">{a.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{a.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Audience;
