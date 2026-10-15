import clouds from "@/assets/clouds-balance.png";

const AISE = () => {
  return (
    <section id="aise" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-glow rounded-full blur-3xl opacity-50" />
          <img
            src={clouds}
            alt="Ilustración 3D de equilibrio mental"
            width={1024}
            height={1024}
            loading="lazy"
            className="relative w-full max-w-md mx-auto animate-float-slow"
          />
        </div>

        <div>
          <span className="text-sm font-semibold text-gradient uppercase tracking-wider">Conoce a A.I.S.E.</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-4 mb-6 tracking-tight leading-tight">
            Un compañero que <span className="text-gradient">escucha de verdad</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            Asistente de Inteligencia Socioemocional. Una IA conversacional entrenada con principios psicológicos para ayudarte a nombrar lo que sientes, reflexionar sin juicio y construir hábitos emocionales saludables.
          </p>

          <div className="space-y-4">
            {[
              { label: "Disponible 24/7", value: "Cuando tu mente lo necesite" },
              { label: "Privacidad total", value: "Cifrado de extremo a extremo" },
              { label: "Aval clínico", value: "Universidad Popular del Cesar" },
            ].map((item) => (
              <div key={item.label} className="glass rounded-2xl px-5 py-4 flex items-center justify-between">
                <span className="font-semibold">{item.label}</span>
                <span className="text-sm text-muted-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AISE;
