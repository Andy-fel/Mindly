import heroWave from "@/assets/hero-wave.png";
import { ArrowRight, Mic } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative pt-36 pb-24 px-6 overflow-hidden">
      {/* floating glow orbs */}
      <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-pink/30 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 rounded-full bg-mint/30 blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <div className="relative max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 text-xs font-medium animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
          Asistente de voz con IA · A.I.S.E.
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-6 animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          Tu voz tiene poder,<br />
          <span className="text-gradient">nosotros te escuchamos</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
          Conversa con A.I.S.E., el asistente de voz inteligente que te acompaña a gestionar tu inteligencia emocional y detecta crisis en tiempo real.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <Link to="/login" >
            <button className="group relative inline-flex items-center gap-3 bg-gradient-primary text-foreground font-semibold px-8 py-4 rounded-full shadow-soft hover:shadow-glow transition-all hover:scale-105">
              <Mic className="w-5 h-5" />
              Empieza tu primera charla
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link to="/login" >
            <button className="glass rounded-full px-8 py-4 font-medium hover:bg-white/80 transition-all">
              Conoce a A.I.S.E.
            </button>
          </Link>

        </div>

        {/* Hero illustration */}
        <div className="relative mt-20 animate-fade-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
          <div className="glass-strong rounded-[2.5rem] p-6 md:p-12 max-w-4xl mx-auto shadow-soft">
            <img
              src={heroWave}
              alt="Onda de voz fluida representando al asistente A.I.S.E."
              width={1280}
              height={1280}
              className="w-full h-auto animate-float"
            />
            <div className="flex items-center justify-center gap-3 -mt-8">
              <div className="flex gap-1 items-end h-12">
                {[40, 70, 30, 90, 50, 80, 35, 60].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-gradient-primary animate-pulse"
                    style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
