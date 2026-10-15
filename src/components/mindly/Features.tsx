import iconVoice from "@/assets/icon-voice.png";
import iconMemory from "@/assets/icon-memory.png";
import iconShield from "@/assets/icon-shield.png";

const features = [
  {
    icon: iconVoice,
    title: "Interacción Natural por Voz",
    description: "Habla con A.I.S.E. como lo harías con un amigo. Reconocimiento empático que entiende tono, pausas y emoción detrás de cada palabra.",
    accent: "from-pink/40 to-lavender/40",
  },
  {
    icon: iconMemory,
    title: "Memoria Semántica de Sesiones",
    description: "Cada conversación construye tu historia. A.I.S.E. recuerda lo que importa para ofrecerte un acompañamiento verdaderamente personal.",
    accent: "from-lavender/40 to-mint/40",
  },
  {
    icon: iconShield,
    title: "Protocolo de Seguridad S.O.S",
    description: "Detección de crisis en tiempo real. Si la conversación lo requiere, activamos rutas de ayuda profesional inmediata.",
    accent: "from-mint/40 to-pink/40",
  },
];

const Features = () => {
  return (
    <section id="features" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-sm font-semibold text-gradient uppercase tracking-wider">Funcionalidades</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-4 mb-5 tracking-tight">
            Diseñado para cuidar tu mente
          </h2>
          <p className="text-muted-foreground text-lg">
            Tecnología cálida, científica y segura para acompañarte en cada momento.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative glass rounded-3xl p-8 hover:shadow-soft transition-all duration-500 hover:-translate-y-2"
            >
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`} />

              <div className="relative w-24 h-24 mb-6 mx-auto">
                <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} rounded-full blur-2xl opacity-60`} />
                <img
                  src={f.icon}
                  alt=""
                  width={512}
                  height={512}
                  loading="lazy"
                  className="relative w-full h-full object-contain animate-float"
                  style={{ animationDelay: `${i * 0.5}s` }}
                />
              </div>

              <h3 className="text-xl font-bold text-center mb-3">{f.title}</h3>
              <p className="text-muted-foreground text-center text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
