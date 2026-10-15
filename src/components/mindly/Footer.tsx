import { Instagram, Twitter, Linkedin, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative px-6 pb-10 pt-20">
      <div className="max-w-6xl mx-auto glass rounded-3xl p-10">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-primary shadow-glow" />
              <span className="font-bold text-lg">Mindly</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Salud mental conversacional impulsada por A.I.S.E., desarrollada en colaboración con la Universidad Popular del Cesar.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Producto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Funcionalidades</a></li>
              <li><a href="#aise" className="hover:text-foreground transition-colors">A.I.S.E.</a></li>
              <li><a href="#testimonials" className="hover:text-foreground transition-colors">Testimonios</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Política de Privacidad (Ley 1581)</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Tratamiento de datos</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/40">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Mindly. Hecho con cuidado en Colombia.
          </p>
          <div className="flex items-center gap-3">
            {[Instagram, Twitter, Linkedin, Facebook].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-gradient-primary transition-all hover:scale-110"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
