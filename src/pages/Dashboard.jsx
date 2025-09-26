// src/pages/Dashboard.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Calcular días desde registro
  const daysSinceRegistration = user?.createdAt
    ? Math.floor(
        (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="dashboard-container">
      {/* Header del Dashboard */}
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>
            ¡Bienvenido de vuelta,{" "}
            <span className="username">{user?.username}</span>!
          </h1>
          <p className="welcome-subtitle">
            Aquí tienes un resumen de tu cuenta y actividad
          </p>
          <p className="account-info">
            Miembro desde hace <strong>{daysSinceRegistration}</strong> días
          </p>
        </div>

        <div className="user-controls">
          <div className="user-avatar">
            <div className="avatar-circle">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>

        </div>
      </header>

      {/* Contenido principal */}
      <main className="dashboard-content">
        <section className="card">
          <h2>📊 Actividad reciente</h2>
          <p>No tienes actividad registrada aún.</p>
        </section>

        <section className="card">
          <h2>⚙️ Configuración rápida</h2>
          <Link to="/profile" className="btn-link">
            Ver perfil
          </Link>
          <Link to="/settings" className="btn-link">
            Ajustes
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
