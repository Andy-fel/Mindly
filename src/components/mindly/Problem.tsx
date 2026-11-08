import { HeartPulse, ShieldAlert, Sparkles } from "lucide-react";

const Problem = () => {
  return (
    <section id="problem" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-gradient uppercase tracking-wider">El problema</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-4 mb-5 tracking-tight">
            Cuando esperar no es una opción
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            La falta de acompañamiento inmediato y accesible en salud mental deja a muchas personas sin respuesta en sus momentos más vulnerables.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="glass rounded-3xl p-10 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-soft">
                <HeartPulse className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Brecha de acceso</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Largas listas de espera y barreras económicas alejan a las personas de la ayuda profesional cuando más la necesitan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-soft">
                <ShieldAlert className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Crisis silenciosas</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Las señales tempranas de una crisis emocional suelen pasar desapercibidas hasta convertirse en un riesgo mayor.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-soft">
                <Sparkles className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Nuestra respuesta</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Mindly detecta señales de crisis emocional mediante lenguaje natural y reduce la brecha hacia la ayuda profesional.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-glow rounded-full blur-3xl opacity-40" />
            <div className="relative glass-strong rounded-3xl p-10 text-center">
              <p className="text-6xl md:text-7xl font-extrabold text-gradient mb-3">24/7</p>
              <p className="text-muted-foreground mb-8">Acompañamiento disponible siempre</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-5">
                  <p className="text-3xl font-bold text-gradient">+75%</p>
                  <p className="text-xs text-muted-foreground mt-1">de universitarios reportan ansiedad</p>
                </div>
                <div className="glass rounded-2xl p-5">
                  <p className="text-3xl font-bold text-gradient">&lt;1s</p>
                  <p className="text-xs text-muted-foreground mt-1">para detectar señales de crisis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
