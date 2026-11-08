import { Code2, Database, Sparkles, Rocket } from "lucide-react";

const stack = [
  {
    icon: Code2,
    label: "Frontend",
    items: ["React", "Tailwind CSS", "Vite"],
  },
  {
    icon: Database,
    label: "Backend & Database",
    items: ["Firebase Auth", "Firestore", "Cloud Functions"],
  },
  {
    icon: Sparkles,
    label: "Cerebro IA",
    items: ["Google Gemini", "1.5 Flash"],
  },
  {
    icon: Rocket,
    label: "Despliegue",
    items: ["Vercel"],
  },
];

const TechStack = () => {
  return (
    <section id="stack" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-gradient uppercase tracking-wider">Stack tecnológico</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-4 mb-5 tracking-tight">
            Construido con tecnología moderna
          </h2>
          <p className="text-muted-foreground text-lg">
            Herramientas confiables y escalables que sostienen cada conversación.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stack.map((s) => (
            <div
              key={s.label}
              className="glass rounded-3xl p-7 hover:shadow-soft transition-all duration-500 hover:-translate-y-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center mb-5 shadow-soft">
                <s.icon className="w-6 h-6 text-foreground" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{s.label}</p>
              <ul className="space-y-1.5">
                {s.items.map((item) => (
                  <li key={item} className="text-sm font-semibold">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
