// src/pages/ResetPassword.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import MessageAlert from "../components/Common/MessageAlert";
import { validateEmail, validatePassword, validatePasswordMatch, validateResetCode } from "../utils/validators";
import "./Login.css";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [validationErrors, setValidationErrors] = useState({});
  const { loading, error, success, resetPassword, clearMessages } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Validación en tiempo real
    const newErrors = { ...validationErrors };

    switch (name) {
      case 'email':
        const emailValidation = validateEmail(value);
        if (emailValidation.isValid) {
          delete newErrors.email;
        } else {
          newErrors.email = emailValidation.error;
        }
        break;
      case 'code':
        const codeValidation = validateResetCode(value);
        if (codeValidation.isValid) {
          delete newErrors.code;
        } else {
          newErrors.code = codeValidation.error;
        }
        break;
      case 'newPassword':
        const passwordValidation = validatePassword(value);
        if (passwordValidation.isValid) {
          delete newErrors.newPassword;
        } else {
          newErrors.newPassword = passwordValidation.error;
        }
        // Revalidar confirmación si existe
        if (formData.confirmPassword) {
          const matchValidation = validatePasswordMatch(value, formData.confirmPassword);
          if (matchValidation.isValid) {
            delete newErrors.confirmPassword;
          } else {
            newErrors.confirmPassword = matchValidation.error;
          }
        }
        break;
      case 'confirmPassword':
        const matchValidation = validatePasswordMatch(formData.newPassword, value);
        if (matchValidation.isValid) {
          delete newErrors.confirmPassword;
        } else {
          newErrors.confirmPassword = matchValidation.error;
        }
        break;
    }

    setValidationErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    // Validar todos los campos
    const errors = {};

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) errors.email = emailValidation.error;

    const codeValidation = validateResetCode(formData.code);
    if (!codeValidation.isValid) errors.code = codeValidation.error;

    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) errors.newPassword = passwordValidation.error;

    const matchValidation = validatePasswordMatch(formData.newPassword, formData.confirmPassword);
    if (!matchValidation.isValid) errors.confirmPassword = matchValidation.error;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await resetPassword(formData.email, formData.code, formData.newPassword);

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      // Error ya manejado en el hook
    }
  };

  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const isFormValid = formData.email && formData.code && formData.newPassword && formData.confirmPassword && !hasValidationErrors;

  return (
    <div className="auth-container">
      <div className="auth-card animate-slide-in">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.11 7 14 7.89 14 9C14 10.11 13.11 11 12 11C10.89 11 10 10.11 10 9C10 7.89 10.89 7 12 7M18 9C18 12.53 15.36 15.45 12 16C8.64 15.45 6 12.53 6 9V6.3L12 3.19L18 6.3V9Z"/>
            </svg>
          </div>
          <h1 className="auth-title">Restablecer Contraseña</h1>
          <p className="auth-subtitle">
            Ingresa el código que recibiste por email y tu nueva contraseña.
          </p>
        </div>

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
              className={`form-input ${validationErrors.email ? 'error' : ''}`}
              placeholder="tu.email@ejemplo.com"
              required
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            {validationErrors.email && (
              <div className="form-error">
                {validationErrors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="code" className="form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z"/>
              </svg>
              Código de recuperación
            </label>
            <input
              type="text"
              id="code"
              name="code"
              className={`form-input ${validationErrors.code ? 'error' : ''}`}
              placeholder="Ingresa el código de 6 dígitos"
              required
              value={formData.code}
              onChange={handleChange}
              disabled={loading}
              maxLength="6"
            />
            {validationErrors.code && (
              <div className="form-error">
                {validationErrors.code}
              </div>
            )}
          </div>



          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17C10.89 17 10 16.1 10 15C10 13.89 10.89 13 12 13C13.11 13 14 13.89 14 15C14 16.1 13.11 17 12 17M18 20V10H6V20H18M18 8C19.11 8 20 8.89 20 10V20C20 21.11 19.11 22 18 22H6C4.89 22 4 21.11 4 20V10C4 8.89 4.89 8 6 8H7V6C7 3.24 9.24 1 12 1C14.76 1 17 3.24 17 6V8H18M12 3C10.34 3 9 4.34 9 6V8H15V6C15 4.34 13.66 3 12 3Z"/>
              </svg>
              Nueva contraseña
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className={`form-input ${validationErrors.newPassword ? 'error' : ''}`}
              placeholder="Mínimo 6 caracteres"
              required
              value={formData.newPassword}
              onChange={handleChange}
              disabled={loading}
              minLength="6"
            />
            {validationErrors.newPassword && (
              <div className="form-error">
                {validationErrors.newPassword}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17C10.89 17 10 16.1 10 15C10 13.89 10.89 13 12 13C13.11 13 14 13.89 14 15C14 16.1 13.11 17 12 17M18 20V10H6V20H18M18 8C19.11 8 20 8.89 20 10V20C20 21.11 19.11 22 18 22H6C4.89 22 4 21.11 4 20V10C4 8.89 4.89 8 6 8H7V6C7 3.24 9.24 1 12 1C14.76 1 17 3.24 17 6V8H18M12 3C10.34 3 9 4.34 9 6V8H15V6C15 4.34 13.66 3 12 3Z"/>
              </svg>
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
              placeholder="Repite la contraseña"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              minLength="6"
            />
            {validationErrors.confirmPassword && (
              <div className="form-error">
                {validationErrors.confirmPassword}
              </div>
            )}
          </div>


          <button
            type="submit"
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Restableciendo...
              </>
            ) : (
              "Restablecer contraseña"
            )}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password" className="auth-link">
            ¿No tienes un código? Solicitar código
          </Link>
          <Link to="/login" className="auth-link">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;