const team = [
  {
    name: "Andrés Barragan",
    role: "Full-Stack · Project Manager",
    initials: "AB",
    accent: "from-pink/60 to-lavender/60",
  },
  {
    name: "Camilo Reyes",
    role: "Diseñador UI/UX",
    initials: "CR",
    accent: "from-lavender/60 to-mint/60",
  },
  {
    name: "Karolay Sierra",
    role: "Analista de Datos",
    initials: "KS",
    accent: "from-mint/60 to-pink/60",
  },
];

const Team = () => {
  return (
    <section id="team" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-gradient uppercase tracking-wider">Equipo</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-4 mb-5 tracking-tight">
            Las mentes detrás de Mindly
          </h2>
          <p className="text-muted-foreground text-lg">
            Un equipo multidisciplinario unido por una misma causa: cuidar la salud mental.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {team.map((m) => (
            <div
              key={m.name}
              className="group relative glass rounded-3xl p-8 text-center hover:shadow-soft transition-all duration-500 hover:-translate-y-2"
            >
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${m.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`} />

              <div className="relative w-24 h-24 mx-auto mb-5">
                <div className={`absolute inset-0 bg-gradient-to-br ${m.accent} rounded-full blur-2xl opacity-70`} />
                <div className="relative w-full h-full rounded-full bg-gradient-primary flex items-center justify-center shadow-soft text-2xl font-extrabold text-foreground">
                  {m.initials}
                </div>
              </div>

              <h3 className="text-lg font-bold mb-1">{m.name}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{m.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
