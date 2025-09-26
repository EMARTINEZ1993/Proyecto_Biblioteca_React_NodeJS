// src/pages/Profile.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "El nombre de usuario es requerido";
    else if (formData.username.length < 3) newErrors.username = "Debe tener al menos 3 caracteres";

    if (!formData.email.trim()) newErrors.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Formato inválido";

    if (showPasswordFields) {
      if (!formData.currentPassword) newErrors.currentPassword = "La contraseña actual es requerida";
      if (!formData.newPassword) newErrors.newPassword = "La nueva contraseña es requerida";
      else if (formData.newPassword.length < 6) newErrors.newPassword = "Debe tener al menos 6 caracteres";
      if (formData.newPassword !== formData.confirmPassword)
        newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setLoading(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");

      const existingUser = users.find(
        (u) => u.id !== user.id && (u.username === formData.username || u.email === formData.email)
      );

      if (existingUser) {
        setErrors(
          existingUser.username === formData.username
            ? { username: "Este nombre de usuario ya está en uso" }
            : { email: "Este email ya está en uso" }
        );
        setLoading(false);
        return;
      }

      if (showPasswordFields && user.password !== formData.currentPassword) {
        setErrors({ currentPassword: "La contraseña actual es incorrecta" });
        setLoading(false);
        return;
      }

      const updatedUser = {
        ...user,
        username: formData.username,
        email: formData.email,
        ...(showPasswordFields && { password: formData.newPassword }),
      };

      const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      updateUser(updatedUser);

      setSuccess("Perfil actualizado correctamente");
      if (showPasswordFields) {
        setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordFields(false);
      }
    } catch {
      setErrors({ general: "Error al actualizar el perfil. Inténtalo de nuevo." });
    } finally {
      setLoading(false);
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
                  <path d="M12 4A4 4 0 0 1 16 8A4 4 0 0 1 12 12A4 4 0 0 1 8 8A4 4 0 0 1 12 4M12 14C16.42 14 20 15.79 20 18V20H4V18C4 15.79 7.58 14 12 14Z"/>
                </svg>
              </div>
              <h1 className="auth-title">Mi Perfil</h1>
            </div>
            <p className="auth-subtitle">Actualiza tu información personal y configuración</p>
          </div>

          {errors.general && (
            <div className="message error animate-shake">{errors.general}</div>
          )}
          {success && (
            <div className="message success">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Nombre de Usuario</label>
              <input
                type="text"
                id="username"
                name="username"
                className={`form-input ${errors.username ? "error" : ""}`}
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${errors.email ? "error" : ""}`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-section">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
              >
                {showPasswordFields ? "Cancelar" : "Cambiar Contraseña"}
              </button>

              {showPasswordFields && (
                <div className="fade-in">
                  <div className="form-group">
                    <label htmlFor="currentPassword" className="form-label">Contraseña Actual</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      className={`form-input ${errors.currentPassword ? "error" : ""}`}
                      value={formData.currentPassword}
                      onChange={handleChange}
                    />
                    {errors.currentPassword && <span className="error-text">{errors.currentPassword}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      className={`form-input ${errors.newPassword ? "error" : ""}`}
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                    {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className={`btn btn-primary ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </form>

          <div className="auth-links">
            <p className="auth-link-text">
              <Link to="/dashboard" className="auth-link">← Volver al Dashboard</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
