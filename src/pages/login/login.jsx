import React, { useState } from "react";
import { auth } from "../../firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, EmailAuthProvider, linkWithCredential } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../login/login_style.css";

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // NUEVOS ESTADOS PARA LA VINCULACIÓN EN INTERFAZ
  const [isLinkingPassword, setIsLinkingPassword] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // 1. LOGIN NORMAL CON CORREO Y CONTRASEÑA
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert("Por favor, completa todos los campos para acceder por correo.");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Sesión iniciada:", userCredential.user);
      alert("¡Bienvenido!");
      navigate('/chat');
    } catch (error) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        alert("Credenciales incorrectas. Revisa tu correo o contraseña.");
      } else {
        alert("Error al iniciar sesión: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. PASO 1 DE GOOGLE: Autenticar y evaluar si necesita contraseña
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (!user.email) {
        alert("No se pudo obtener un correo válido de Google.");
        return;
      }

      // Verificar si ya tiene proveedor de contraseña
      const hasPassword = user.providerData.some(p => p.providerId === 'password');

      if (!hasPassword) {
        // Si el usuario ya había escrito algo en el campo contraseña antes de hundir Google
        if (password && password.length >= 6) {
          // Intentamos vincularla directamente de una vez
          try {
            const credential = EmailAuthProvider.credential(user.email, password);
            await linkWithCredential(user, credential);
            alert("¡Contraseña vinculada exitosamente! Cuenta unificada.");
            finalizarLogin();
          } catch (error) {
            console.error("Error al vincular directa:", error);
            // Si falla la vinculación directa, activamos el modo de interfaz
            prepararModoVinculacion(user);
          }
        } else {
          // Si el campo estaba vacío o era muy corto, activamos el modo interfaz
          prepararModoVinculacion(user);
        }
      } else {
        // Si ya tenía contraseña, entra directo
        finalizarLogin();
      }

    } catch (error) {
      alert("Error al iniciar sesión con Google: " + error.message);
      setIsLoading(false);
    }
  };

  const prepararModoVinculacion = (user) => {
    setGoogleUser(user);
    setPassword(''); // Limpiamos el input para que ponga la nueva
    setIsLinkingPassword(true); // Oculta el correo y activa el modo vinculación
    setIsLoading(false);
  };

  // 3. PASO 2 DE GOOGLE: El usuario escribe la contraseña en el input y hunde el botón
  const handleCompleteLinking = async (e) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      const credential = EmailAuthProvider.credential(googleUser.email, password);
      await linkWithCredential(googleUser, credential);
      alert("¡Contraseña vinculada exitosamente! Ahora puedes usar ambos métodos.");
      finalizarLogin();
    } catch (error) {
      console.error("Error al vincular contraseña en interfaz:", error);
      alert("No se pudo vincular la contraseña: " + error.message);
      setIsLoading(false);
    }
  };

  const finalizarLogin = () => {
    setEmail('');
    setPassword('');
    setIsLinkingPassword(false);
    setGoogleUser(null);
    setIsLoading(false);
    navigate('/chat');
  };

  // Cancelar el proceso de vinculación si el usuario no quiere poner contraseña
  const handleOmitirVinculacion = () => {
    finalizarLogin();
  };

  return (
    <div className="login-container">
      <main className="login-card" role="main">
        <h1 className="text-4xl font-bold mb-1 text-[#E8A5CD]">Mindly</h1>
        <p className="text-sm mb-10 text-[#A0989B]">
          {isLinkingPassword ? "Protege tu cuenta" : "Tu santuario digital"}
        </p>

        {/* Cambiamos la función del Submit según el estado de la interfaz */}
        <form id="loginForm" onSubmit={isLinkingPassword ? handleCompleteLinking : handleLogin}>
          
          {/* SI ESTÁ VINCULANDO, ESTE CAMPO DESAPARECE COMPLETAMENTE */}
          {!isLinkingPassword && (
            <div className="input-group">
              <label htmlFor="email">Correo electrónico</label>
              <div className="input-wrapper">
                <span className="material-icons-outlined">email</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ESTE CAMPO DE CONTRASEÑA SE QUEDA SIEMPRE, PERO CAMBIA EL TEXTO DEL LABEL SI SE ESTÁ VINCULANDO */}
          <div className="input-group">
            <label htmlFor="password">
              {isLinkingPassword ? "Crea una contraseña para tu cuenta" : "Contraseña"}
            </label>
            <div className="input-wrapper">
              <span className="material-icons-outlined">lock</span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="material-icons-outlined visibility"
                aria-hidden="true"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? 'visibility' : 'visibility_off'}
              </span>
            </div>
          </div>

          {/* EL BOTÓN PRINCIPAL CAMBIA SU TEXTO Y FUNCIÓN SEGÚN EL ESTADO */}
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Cargando...' : isLinkingPassword ? 'Vincular y Finalizar' : 'Acceder'}
          </button>

          {/* SI ESTÁ EN MODO VINCULACIÓN, DAMOS UN BOTÓN PARA PASAR DE LARGO (OMITIR) */}
          
        </form>

        {/* SI ESTÁ VINCULANDO, SE OCULTA TODO LO QUE ESTÁ ABAJO (GOOGLE Y ENLACES) */}
        {!isLinkingPassword && (
          <>
            <div className="divider"><span>O</span></div>

            <button
              type="button"
              className="btn-google"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <img
                src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
                alt="Google"
                width="20"
              />
              Continuar con Google
            </button>

            <div className="mt-6 text-sm">
              <a href="#" className="text-[#A0989B] hover:text-[#7D7578]">Recuperar contraseña</a>
            </div>

            <div className="footer-links">
              ¿No tienes una cuenta? <a href="#">Crear Cuenta</a>
            </div>
          </>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Pie de página">
        <span>© 2026 Mindly. Un santuario digital para tu mente.</span>
        <div className="links" style={{ display: 'flex', gap: '0.75rem' }}>
          <a href="#" className="hover:underline">Privacidad</a>
          <a href="#" className="hover:underline">Términos</a>
          <a href="#" className="hover:underline">Ayuda</a>
        </div>
      </nav>
    </div>
  );
};

export default LoginForm;