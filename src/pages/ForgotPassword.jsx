// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import MessageAlert from "../components/Common/MessageAlert";
import { validateEmail } from "../utils/validators";
import { emailExists } from "../utils/userHelpers";
import EmailJSConfig from "../components/EmailJSConfig";
import "./Login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [isEmailJSConfigured, setIsEmailJSConfigured] = useState(false);
  const { theme } = useTheme();
  const { loading, error, success, requestPasswordReset, clearMessages } =
    useAuth();

  React.useEffect(() => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const configured =
      serviceId &&
      templateId &&
      publicKey &&
      serviceId !== "tu-service-id" &&
      templateId !== "tu-template-id" &&
      publicKey !== "tu-public-key";

    setIsEmailJSConfigured(configured);
  }, []);

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    setEmailError("");
    clearMessages();

    if (newEmail && !validateEmail(newEmail).isValid) {
      setEmailError(validateEmail(newEmail).message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setEmailError("");
    clearMessages();

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.message);
      return;
    }

    if (!emailExists(email)) {
      setEmailError(
        "No existe una cuenta asociada a este correo electrónico. ¿Necesitas registrarte?"
      );
      return;
    }

    try {
      await requestPasswordReset(email);
    } catch (err) {
      console.error("Error en recuperación de contraseña:", err);
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
                  <path d="M12 17A2 2 0 0 0 14 15C14 13.89 13.1 13 12 13A2 2 0 0 0 10 15A2 2 0 0 0 12 17M18 8A2 2 0 0 1 20 10V20A2 2 0 0 1 18 22H6A2 2 0 0 1 4 20V10C4 8.89 4.9 8 6 8H7V6A5 5 0 0 1 12 1A5 5 0 0 1 17 6V8H18M12 3A3 3 0 0 0 9 6V8H15V6A3 3 0 0 0 12 3Z"/>
                </svg>
              </div>
              <h1 className="auth-title">Recuperar Contraseña</h1>
            </div>
            <p className="auth-subtitle">Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña</p>
          </div>

          {/* Configuración EmailJS */}
          {!isEmailJSConfigured && (
            <div className="message info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 13H11V7H13M13 17H11V15H13M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2Z"/>
              </svg>
              <div>
                <strong>Configuración de EmailJS requerida</strong>
                <p>Para enviar emails de recuperación, necesitas configurar EmailJS.</p>
                <button 
                  type="button" 
                  onClick={() => setShowConfig(!showConfig)}
                  className="btn btn-primary"
                  style={{marginTop: '8px', padding: '8px 16px', fontSize: '12px'}}
                >
                  {showConfig ? 'Ocultar' : 'Mostrar'} configuración
                </button>
              </div>
            </div>
          )}

          {showConfig && (
            <EmailJSConfig
              onConfigComplete={(configured) => {
                setIsEmailJSConfigured(configured);
                if (configured) {
                  setShowConfig(false);
                }
              }}
            />
          )}

          {/* Mensajes */}
          {error && (
            <div className="message error animate-shake">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 13H11V7H13M13 17H11V15H13M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2Z"/>
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="message success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
              </svg>
              {success}
            </div>
          )}


          {/* Formulario */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4M20 8L12 13L4 8V6L12 11L20 6V8Z"/>
                </svg>
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${emailError ? 'error' : ''}`}
                placeholder="tu.email@ejemplo.com"
                required
                value={email}
                onChange={handleEmailChange}
                disabled={loading}
              />
              {emailError && (
                <div className="form-error">
                  {emailError}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary ${loading ? 'loading' : ''}`} 
              disabled={loading || !email || emailError}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Enviando...
                </>
              ) : (
                'Enviar Código de Recuperación'
              )}
            </button>
          </form>

          {/* Enlaces */}
          <div className="auth-links">
            <Link to="/reset-password" className="auth-link">
              ¿Ya tienes un código? Restablecer contraseña
            </Link>
            <Link to="/login" className="auth-link">
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
