const testimonials = [
  {
    quote: "Hablar con A.I.S.E. antes de mis exámenes me ayuda a calmar la ansiedad. Es como tener un amigo que siempre está disponible.",
    name: "Mariana López",
    role: "Estudiante de Psicología, UPC",
    initials: "ML",
  },
  {
    quote: "Como psicóloga, valoro que Mindly no reemplaza la terapia, la complementa. La detección de crisis es realmente impresionante.",
    name: "Dra. Carolina Mendoza",
    role: "Psicóloga clínica, UPC",
    initials: "CM",
  },
  {
    quote: "Llevo tres meses usándolo y siento que entiendo mejor mis emociones. La memoria de las sesiones marca la diferencia.",
    name: "Andrés Restrepo",
    role: "Estudiante de Ingeniería, UPC",
    initials: "AR",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-gradient uppercase tracking-wider">Testimonios</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-4 mb-5 tracking-tight">
            Voces de la Universidad Popular del Cesar
          </h2>
          <p className="text-muted-foreground text-lg">
            Estudiantes y profesionales que ya forman parte de Mindly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className="glass rounded-3xl p-8 flex flex-col gap-6 hover:shadow-soft transition-all hover:-translate-y-1"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex gap-1 text-pink">
                {Array.from({ length: 5 }).map((_, j) => (
                  <svg key={j} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 15l-5.3 2.8 1-5.9L1.4 7.7l5.9-.9z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-foreground/90 leading-relaxed flex-1">
                "{t.quote}"
              </blockquote>
              <figcaption className="flex items-center gap-3 pt-4 border-t border-white/40">
                <div className="w-11 h-11 rounded-full bg-gradient-primary flex items-center justify-center font-bold text-sm shadow-glass">
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
