import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1200px,92%)]">
      <div className="glass rounded-full px-6 py-3 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-primary shadow-glow" />
          <span className="font-bold text-lg tracking-tight">Mindly</span>
        </a>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#inicio" className="hover:text-foreground transition-colors">Mindly</a>
          <a href="#features" className="hover:text-foreground transition-colors">Funcionalidades</a>
          <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonios</a>
          <a href="#aise" className="hover:text-foreground transition-colors">A.I.S.E.</a>
        </div>
        <Link 
          to="/login"
          className="text-sm font-semibold px-5 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity"
        >
          Iniciar
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
