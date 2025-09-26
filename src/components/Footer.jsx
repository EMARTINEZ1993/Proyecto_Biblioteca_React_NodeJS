// src/components/Layout/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "./Footer.css";

const Footer = () => {
  const { theme } = useTheme();
  
  return (
    <footer className={`footer animate-fade-in ${theme}`}>
       
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Mi Proyecto. Todos los derechos reservados.
          </p>
          <p className="footer-version">
            Versión 1.0.0
          </p>
        </div>
  
    </footer>
  );
};

export default Footer;
