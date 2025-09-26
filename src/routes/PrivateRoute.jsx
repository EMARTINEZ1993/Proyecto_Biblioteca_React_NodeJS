// src/routes/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, isInitializing } = useAuth();
  
  // Mostrar loading mientras se inicializa el contexto
  if (isInitializing) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Cargando...
      </div>
    );
  }
  
  // Solo redirigir al login después de que la inicialización esté completa
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;