// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import './Login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Función para calcular la fortaleza de la contraseña
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^\w\s]/.test(password)
    };
    
    // Calcular puntuación
    if (checks.length) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.numbers) score += 20;
    if (checks.symbols) score += 20;
    
    // Bonificaciones
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    
    // Determinar nivel
    if (score < 40) {
      return { score, label: 'Muy débil', color: '#dc2626', checks };
    } else if (score < 60) {
      return { score, label: 'Débil', color: '#ea580c', checks };
    } else if (score < 80) {
      return { score, label: 'Moderada', color: '#d97706', checks };
    } else if (score < 100) {
      return { score, label: 'Fuerte', color: '#16a34a', checks };
    } else {
      return { score, label: 'Muy fuerte', color: '#15803d', checks };
    }
  };

  // Validación en tiempo real
  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'username':
        if (!value.trim()) {
          errors.username = 'El nombre de usuario es requerido';
        } else if (value.length < 3) {
          errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          errors.username = 'Solo se permiten letras, números y guiones bajos';
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          errors.email = 'El correo electrónico es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Ingresa un correo electrónico válido';
        }
        break;
        
      case 'password':
        if (!value) {
          errors.password = 'La contraseña es requerida';
        } else if (value.length < 6) {
          errors.password = 'La contraseña debe tener al menos 6 caracteres';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errors.password = 'Debe contener al menos una mayúscula, una minúscula y un número';
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Confirma tu contraseña';
        } else if (value !== formData.password) {
          errors.confirmPassword = 'Las contraseñas no coinciden';
        }
        break;
        
      case 'firstName':
        if (!value.trim()) {
          errors.firstName = 'El nombre es requerido';
        } else if (value.length < 2) {
          errors.firstName = 'El nombre debe tener al menos 2 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          errors.firstName = 'El nombre solo puede contener letras y espacios';
        }
        break;
        
      case 'lastName':
        if (!value.trim()) {
          errors.lastName = 'El apellido es requerido';
        } else if (value.length < 2) {
          errors.lastName = 'El apellido debe tener al menos 2 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          errors.lastName = 'El apellido solo puede contener letras y espacios';
        }
        break;
        
      default:
        break;
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Validar campo si ya fue tocado
    if (fieldTouched[name]) {
      const fieldValidationErrors = validateField(name, value);
      setFieldErrors(prev => ({
        ...prev,
        [name]: fieldValidationErrors[name] || null
      }));
      
      // Validar confirmPassword si se cambió password
      if (name === 'password' && fieldTouched.confirmPassword) {
        const confirmErrors = validateField('confirmPassword', formData.confirmPassword);
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: confirmErrors.confirmPassword || null
        }));
      }
    }
  };
  
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setFieldTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const fieldValidationErrors = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: fieldValidationErrors[name] || null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validar todos los campos
    const allErrors = {};
    Object.keys(formData).forEach(field => {
      const fieldValidationErrors = validateField(field, formData[field]);
      if (fieldValidationErrors[field]) {
        allErrors[field] = fieldValidationErrors[field];
      }
    });
    
    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors);
      setFieldTouched({
        username: true,
        email: true,
        password: true,
        confirmPassword: true,
        firstName: true,
        lastName: true
      });
      setError("Por favor corrige los errores en el formulario");
      setIsLoading(false);
      return;
    }

    try {
      // Preparar datos para enviar al backend
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      };

      // Enviar datos al backend
      const response = await fetch('http://localhost:5001/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Manejar errores del servidor
        if (data.errors && Array.isArray(data.errors)) {
          // Errores de validación
          const errorMessages = data.errors.map(err => err.msg).join(', ');
          setError(errorMessages);
        } else {
          setError(data.message || 'Error en el registro');
        }
        setIsLoading(false);
        return;
      }

      // Registro exitoso
      setSuccess("¡Registro exitoso! Redirigiendo al login...");
      setIsLoading(false);

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error('Error de conexión:', error);
      setError("Error de conexión. Verifica que el servidor esté funcionando.");
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
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M12 8C14.67 8 17.58 9.35 20 12.22V21H4V12.22C6.42 9.35 9.33 8 12 8Z"/>
                </svg>
              </div>
              <h1 className="auth-title" id="register-title">Crear Cuenta</h1>
            </div>
            <p className="auth-subtitle">Únete a nuestra plataforma de forma segura</p>
          </div>

          {/* Mensajes */}
          {error && (
            <div className={`message error animate-shake`} role="alert" aria-live="assertive">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 13H11V7H13M13 17H11V15H13M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2Z"/>
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="message success" role="alert" aria-live="polite">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 13H11V7H13M13 17H11V15H13M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2Z"/>
              </svg>
              {success}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate aria-labelledby="register-title" role="form">
            {/* Sección: Información Personal */}
              <h3 className="section-title">Información Personal</h3>
              {/* Campo de username */}
            
                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4A4 4 0 0 1 16 8A4 4 0 0 1 12 12A4 4 0 0 1 8 8A4 4 0 0 1 12 4M12 14C16.42 14 20 15.79 20 18V20H4V18C4 15.79 7.58 14 12 14Z"/>
                    </svg>
                    Nombre de usuario *
                  </label>
                  <input
                     type="text"
                     id="username"
                     name="username"
                     className={`form-input ${fieldErrors.username ? 'error' : ''} ${fieldTouched.username && !fieldErrors.username ? 'success' : ''}`}
                     placeholder="Ingresa tu nombre de usuario"
                     required
                     value={formData.username}
                     onChange={handleChange}
                     onBlur={handleBlur}
                     disabled={isLoading}
                     autoComplete="username"
                     aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                   />
                   {fieldErrors.username && (
                     <div id="username-error" className="field-error" role="alert" aria-live="polite">
                       <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                         <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                         <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                         <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                       </svg>
                       {fieldErrors.username}
                     </div>
                   )}
                </div>
              {/* Campos de nombre y apellido */}
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4A4 4 0 0 1 16 8A4 4 0 0 1 12 12A4 4 0 0 1 8 8A4 4 0 0 1 12 4M12 14C16.42 14 20 15.79 20 18V20H4V18C4 15.79 7.58 14 12 14Z"/>
                    </svg>
                    Nombre *
                  </label>
                  <input
                     type="text"
                     id="firstName"
                     name="firstName"
                     className={`form-input ${fieldErrors.firstName ? 'error' : ''} ${fieldTouched.firstName && !fieldErrors.firstName ? 'success' : ''}`}
                     placeholder="Tu nombre"
                     required
                     value={formData.firstName}
                     onChange={handleChange}
                     onBlur={handleBlur}
                     disabled={isLoading}
                     autoComplete="given-name"
                     aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined}
                   />
                   {fieldErrors.firstName && (
                     <div id="firstName-error" className="field-error" role="alert" aria-live="polite">
                       <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                         <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                         <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                         <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                       </svg>
                       {fieldErrors.firstName}
                     </div>
                   )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4A4 4 0 0 1 16 8A4 4 0 0 1 12 12A4 4 0 0 1 8 8A4 4 0 0 1 12 4M12 14C16.42 14 20 15.79 20 18V20H4V18C4 15.79 7.58 14 12 14Z"/>
                    </svg>
                    Apellido *
                  </label>
                  <input
                     type="text"
                     id="lastName"
                     name="lastName"
                     className={`form-input ${fieldErrors.lastName ? 'error' : ''} ${fieldTouched.lastName && !fieldErrors.lastName ? 'success' : ''}`}
                     placeholder="Tu apellido"
                     required
                     value={formData.lastName}
                     onChange={handleChange}
                     onBlur={handleBlur}
                     disabled={isLoading}
                     autoComplete="family-name"
                     aria-describedby={fieldErrors.lastName ? 'lastName-error' : undefined}
                   />
                   {fieldErrors.lastName && (
                     <div id="lastName-error" className="field-error" role="alert" aria-live="polite">
                       <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                         <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                         <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                         <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                       </svg>
                       {fieldErrors.lastName}
                     </div>
                   )}
                </div>
            
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4M20 8L12 13L4 8V6L12 11L20 6V8Z"/>
                    </svg>
                    Correo electrónico *
                  </label>
                  <input
                     type="email"
                     id="email"
                     name="email"
                     className={`form-input ${fieldErrors.email ? 'error' : ''} ${fieldTouched.email && !fieldErrors.email ? 'success' : ''}`}
                     placeholder="ejemplo@correo.com"
                     required
                     value={formData.email}
                     onChange={handleChange}
                     onBlur={handleBlur}
                     disabled={isLoading}
                     autoComplete="email"
                     aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                   />
                   {fieldErrors.email && (
                     <div id="email-error" className="field-error" role="alert" aria-live="polite">
                       <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                         <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                         <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                         <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                       </svg>
                       {fieldErrors.email}
                     </div>
                   )}
                </div>
            {/* Sección: Seguridad */}      
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
                    </svg>
                    Contraseña *
                  </label>
                  <input
                     type="password"
                     id="password"
                     name="password"
                     className={`form-input ${fieldErrors.password ? 'error' : ''} ${fieldTouched.password && !fieldErrors.password ? 'success' : ''}`}
                     placeholder="Mínimo 6 caracteres"
                     required
                     aria-required="true"
                     aria-invalid={fieldTouched.password && fieldErrors.password ? 'true' : 'false'}
                     value={formData.password}
                     onChange={handleChange}
                     onBlur={handleBlur}
                     disabled={isLoading}
                     autoComplete="new-password"
                     aria-describedby={fieldErrors.password ? 'password-error' : 'password-hint'}
                   />
                   {fieldErrors.password && (
                      <div id="password-error" className="field-error" role="alert" aria-live="polite">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        {fieldErrors.password}
                      </div>
                    )}
                    
                    {/* Indicador de fortaleza de contraseña */}
                    {formData.password && (
                      <div className="password-strength" id="password-strength" aria-live="polite">
                        <div className="strength-bar" role="progressbar" aria-valuenow={getPasswordStrength(formData.password).score} aria-valuemin="0" aria-valuemax="100" aria-label="Fortaleza de contraseña">
                          <div 
                            className="strength-fill" 
                            style={{ 
                              width: `${getPasswordStrength(formData.password).score}%`,
                              backgroundColor: getPasswordStrength(formData.password).color
                            }}
                          ></div>
                        </div>
                        <div className="strength-info">
                          <span 
                            className="strength-label" 
                            style={{ color: getPasswordStrength(formData.password).color }}
                            aria-label={`Nivel de seguridad: ${getPasswordStrength(formData.password).label}`}
                          >
                            {getPasswordStrength(formData.password).label}
                          </span>
                          <div className="strength-checks" role="group" aria-label="Requisitos de contraseña">
                            {Object.entries(getPasswordStrength(formData.password).checks || {}).map(([check, passed]) => (
                              <span 
                                key={check} 
                                className={`strength-check ${passed ? 'passed' : 'failed'}`}
                                title={{
                                  length: '8+ caracteres',
                                  lowercase: 'Minúscula',
                                  uppercase: 'Mayúscula', 
                                  numbers: 'Número',
                                  symbols: 'Símbolo'
                                }[check]}
                                aria-label={`${{
                                  length: '8+ caracteres',
                                  lowercase: 'Minúscula',
                                  uppercase: 'Mayúscula', 
                                  numbers: 'Número',
                                  symbols: 'Símbolo'
                                }[check]}: ${passed ? 'cumplido' : 'pendiente'}`}
                              >
                                {passed ? '✓' : '✗'}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!formData.password && (
                      <div id="password-hint" className="form-hint">
                        Debe contener al menos 6 caracteres, una mayúscula, una minúscula y un número
                      </div>
                    )}
                  
                </div>            
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
                    </svg>
                    Confirmar contraseña *
                  </label>
                  <input
                     type="password"
                     id="confirmPassword"
                     name="confirmPassword"
                     className={`form-input ${fieldErrors.confirmPassword ? 'error' : ''} ${fieldTouched.confirmPassword && !fieldErrors.confirmPassword ? 'success' : ''}`}
                     placeholder="Repite tu contraseña"
                     required
                     aria-required="true"
                     aria-invalid={fieldTouched.confirmPassword && fieldErrors.confirmPassword ? 'true' : 'false'}
                     value={formData.confirmPassword}
                     onChange={handleChange}
                     onBlur={handleBlur}
                     disabled={isLoading}
                     autoComplete="new-password"
                     aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : 'confirmPassword-hint'}
                   />
                   {fieldErrors.confirmPassword && (
                     <div id="confirm-password-error" className="field-error" role="alert" aria-live="polite">
                       <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                         <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                         <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                         <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                       </svg>
                       {fieldErrors.confirmPassword}
                     </div>
                   )}
                   <div className="form-hint" id="confirmPassword-hint">Debe coincidir con la contraseña anterior</div>
                </div>
             
            {/* Botón de envío */}
            <div className="form-actions">
              <button 
                type="submit" 
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`} 
                disabled={isLoading}
                aria-describedby={isLoading ? 'loading-status' : undefined}
              >
                {isLoading ? (
                  <>
                    <svg className="loading-spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span id="loading-status" aria-live="polite">Registrando...</span>
                  </>
                ) : (
                  <>
                    Registrarse
                  </>
                )}
              </button>
            </div>
           
          </form>

          {/* Enlaces */}
          <div className="auth-links">
            <p className="auth-link-text">
              ¿Ya tienes cuenta? <Link to="/login" className="auth-link">Inicia sesión aquí</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
