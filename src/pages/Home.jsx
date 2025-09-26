// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      {/* Hero principal con diseño moderno */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span>📚</span>
              Sistema de Biblioteca
            </div>
            <h1 className="hero-title">
              Gestiona tu <span className="gradient-text">Biblioteca Digital</span> de forma Eficiente
            </h1>
            <p className="hero-description">
              Sistema integral para la gestión de bibliotecas que incluye 
              administración de libros, autores, usuarios y préstamos. 
              Controla tu colección bibliográfica con herramientas modernas y seguras.
            </p>
            <div className="hero-actions">
               <Link to="/login" className="btn-primary">Iniciar Sesión</Link>
               <Link to="/register" className="btn-secondary">Crear Cuenta</Link>
             </div>
          </div>
        </div>
      </section>



    </div>
  );
}
