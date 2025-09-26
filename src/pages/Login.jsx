// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Llamada a la API del backend
      const response = await fetch('http://localhost:5001/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: username,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Login exitoso
        console.log('✅ Login exitoso:', data);
        
        // Llamar al login del contexto con los datos del usuario y el token
        login({
          id: data.data.user.id,
          username: data.data.user.username,
          email: data.data.user.email,
          firstName: data.data.user.firstName,
          lastName: data.data.user.lastName,
          fullName: data.data.user.fullName,
          role: data.data.user.role
        }, data.data.token);
        
        navigate("/dashboard");
      } else {
        // Error en el login
        setError(data.message || "Credenciales incorrectas. Por favor, inténtalo de nuevo.");
      }
    } catch (err) {
      console.error('❌ Error en login:', err);
      setError("Error de conexión. Por favor, verifica que el servidor esté funcionando.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`auth-container animate-fade-in ${theme}`}>
      <div className="auth-background">
        <div className="auth-pattern"></div>
      </div>
      
      <div className="auth-content">
        <div className="auth-card animate-slide-in">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.11 7 14 7.89 14 9C14 10.11 13.11 11 12 11C10.89 11 10 10.11 10 9C10 7.89 10.89 7 12 7M18 9C18 13.42 15.28 17.24 11.5 18.5C11.66 18.34 11.8 18.17 11.93 18C14.93 16.22 17 13.24 17 9.5V6.3L12 3.19L7 6.3V9.5C7 10.82 7.4 12.09 8.1 13.1C8.82 12.04 9.87 11.24 11.1 10.8C10.45 10.27 10 9.39 10 8.5C10 7.12 11.12 6 12.5 6S15 7.12 15 8.5C15 9.39 14.55 10.27 13.9 10.8C15.13 11.24 16.18 12.04 16.9 13.1C17.6 12.09 18 10.82 18 9.5V9Z"/>
                </svg>
              </div>
              <h1 className="auth-title">Iniciar Sesión</h1>
            </div>
            <p className="auth-subtitle">Accede a tu cuenta de forma segura</p>
          </div>

          {error && (
            <div className="message error animate-shake">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 13H11V7H13M13 17H11V15H13M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2Z"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4A4 4 0 0 1 16 8A4 4 0 0 1 12 12A4 4 0 0 1 8 8A4 4 0 0 1 12 4M12 14C16.42 14 20 15.79 20 18V20H4V18C4 15.79 7.58 14 12 14Z"/>
                </svg>
                Email o nombre de usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-input"
                placeholder="Ingresa tu email o nombre de usuario"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17A2 2 0 0 0 14 15C14 13.89 13.1 13 12 13A2 2 0 0 0 10 15A2 2 0 0 0 12 17M18 8A2 2 0 0 1 20 10V20A2 2 0 0 1 18 22H6A2 2 0 0 1 4 20V10C4 8.89 4.9 8 6 8H7V6A5 5 0 0 1 12 1A5 5 0 0 1 17 6V8H18M12 3A3 3 0 0 0 9 6V8H15V6A3 3 0 0 0 12 3Z"/>
                </svg>
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="Ingresa tu contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button type="submit" className={`btn btn-primary ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <div className="auth-links">
            <p className="auth-link-text">
              ¿No tienes cuenta? <Link to="/register" className="auth-link">Regístrate aquí</Link>
            </p>
            <p className="auth-link-text">
              ¿Olvidaste tu contraseña? <Link to="/forgot-password" className="auth-link">Recupera tu contraseña</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
