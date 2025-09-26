// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import '../style/style.css';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <nav className="navbar animate-fade-in">
      <div className="navbar-brand">
        <img 
          src="https://onexfy.com/wp-content/uploads/2023/01/onexfy-logo-morado.png.webp" 
          alt="logo" 
          className="navbar-logo"
        />
        <Link to="/" className="navbar-title">Inicio</Link>
      </div>
      
      <div className="navbar-menu">
        <button 
          className="theme-toggle navbar-theme-toggle" 
          onClick={toggleTheme} 
          title={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {isDarkMode ? '🔆' : '🌙'}
        </button>
        
        {!user ? (
          <Link to="/login" className="btn btn-primary">Iniciar sesión</Link>
        ) : (
          <div className="navbar-user-menu">
            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
            <Link to="/user" className="navbar-link">Usuarios</Link>
            <Link to="/authors" className="navbar-link">Escritores</Link>
            <Link to="/books" className="navbar-link">Libros</Link>
            <Link to="/borrow" className="navbar-link">Prestamos</Link>
            <Link to="/profile" className="navbar-link">
            <span className="navbar-username">{user.username}</span>
            </Link>
            <button onClick={logout} className="btn btn-secondary">Cerrar sesión</button>
          </div>
        )}
      </div>
    </nav>
  );
}