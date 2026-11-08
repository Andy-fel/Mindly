import { Mic } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto glass-strong rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-soft">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-pink/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-mint/40 blur-3xl" />

        <div className="relative">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5">
            Tu primera charla<br />está a <span className="text-gradient">una palabra</span>.
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Sin presiones. Sin juicios. Solo tú, tu voz y A.I.S.E. escuchando.
          </p>
          <Link to="/login" >
            <button className="group inline-flex items-center gap-3 bg-foreground text-background font-semibold px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-soft">
              <Mic className="w-5 h-5" />
              Empieza tu primera charla
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
