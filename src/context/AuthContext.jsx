// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { sendPasswordResetEmail, verifyResetCode, markResetCodeAsUsed, clearResetCode } from '../services/emailService';
import { emailExists } from '../utils/userHelpers';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // Estado para la carga inicial
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Función para verificar token con retry
  const verifyTokenWithRetry = async (savedToken, retries = 2) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔍 AuthContext - Verificando token (intento ${attempt}/${retries})...`);
        const response = await fetch('http://localhost:5001/api/users/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          localStorage.setItem('currentUser', JSON.stringify(userData.user));
          console.log('✅ AuthContext - Usuario autenticado:', userData.user);
          return { success: true, userData: userData.user };
        } else if (response.status === 401 || response.status === 403) {
          // Token inválido o expirado
          console.log('❌ AuthContext - Token inválido o expirado');
          return { success: false, error: 'invalid_token' };
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ AuthContext - Error en intento ${attempt}:`, error);
        
        const isNetworkError = error.name === 'TypeError' || 
                              error.message.includes('fetch') || 
                              error.message.includes('NetworkError') ||
                              error.message.includes('Failed to fetch');
        
        if (attempt === retries) {
          // Último intento fallido
          return { success: false, error: isNetworkError ? 'network_error' : 'unknown_error' };
        }
        
        if (isNetworkError && attempt < retries) {
          // Esperar antes del siguiente intento
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        } else {
          // Error no relacionado con la red, no reintentar
          return { success: false, error: 'unknown_error' };
        }
      }
    }
  };

  // Cargar usuario y token desde localStorage al inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 AuthContext - Inicializando autenticación...');
      
      // Cargar token
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        console.log('🔑 AuthContext - Token cargado desde localStorage');
        
        const result = await verifyTokenWithRetry(savedToken);
        
        if (result.success) {
          // Token válido, usuario ya establecido en verifyTokenWithRetry
        } else if (result.error === 'network_error') {
          // Error de red persistente, mantener sesión desde localStorage
          console.log('🔄 AuthContext - Error de red persistente, manteniendo sesión desde localStorage');
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser);
              setUser(userData);
              console.log('✅ AuthContext - Usuario mantenido desde localStorage:', userData);
            } catch (parseError) {
              console.error("❌ AuthContext - Error parsing user data:", parseError);
              localStorage.removeItem('currentUser');
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              setToken(null);
              setUser(null);
            }
          }
        } else {
          // Token inválido o error desconocido, limpiar sesión
          console.log('❌ AuthContext - Limpiando sesión por token inválido');
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } else {
        // No hay token, intentar cargar desde localStorage para compatibilidad
        let savedUser = localStorage.getItem('currentUser');
        if (!savedUser) {
          savedUser = localStorage.getItem('user');
        }
        
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            console.log('🔄 AuthContext - Usuario cargado desde localStorage (sin token):', userData);
          } catch (error) {
            console.error("❌ AuthContext - Error parsing user data:", error);
            localStorage.removeItem('currentUser');
            localStorage.removeItem('user');
          }
        } else {
          console.log('ℹ️ AuthContext - No hay usuario guardado en localStorage');
        }
      }
      
      setIsInitializing(false);
      console.log('✅ AuthContext - Inicialización completada');
    };
    
    initializeAuth();
  }, []);

  const login = (userData, token) => {
    console.log('🔄 AuthContext.login - Iniciando login con datos:', userData);
    
    // Asegurarse de que userData es un objeto válido
    if (userData && typeof userData === 'object') {
      console.log('✅ AuthContext.login - Datos válidos, guardando usuario...');
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Si se proporciona un token, guardarlo también
      if (token) {
        setToken(token);
        localStorage.setItem('token', token);
        console.log('🔑 AuthContext.login - Token guardado');
      }
      
      console.log('💾 AuthContext.login - Usuario guardado en localStorage como currentUser');
      console.log('🔍 AuthContext.login - Verificando localStorage:', {
        currentUser: localStorage.getItem('currentUser'),
        token: localStorage.getItem('token')
      });
    } else {
      console.error('❌ AuthContext.login - Datos de usuario inválidos:', userData);
    }
  };

  const logout = () => {
    console.log('🔄 AuthContext.logout - Cerrando sesión...');
    setUser(null);
    setToken(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('✅ AuthContext.logout - Sesión cerrada y datos limpiados');
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const requestPasswordReset = async (email) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Verificar si el email existe en el sistema
      if (!emailExists(email)) {
        setError('No existe una cuenta asociada a este correo electrónico');
        return;
      }
      
      const result = await sendPasswordResetEmail(email);
      
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message || 'Error al enviar el código');
      }
    } catch (err) {
      console.error('Error en requestPasswordReset:', err);
      setError('Error al enviar el código de recuperación');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Verificar el código
      const isValidCode = verifyResetCode(email, code);
      
      if (!isValidCode) {
        setError('Código inválido o expirado');
        return;
      }
      
      // Simular cambio de contraseña (aquí normalmente harías una llamada a tu API)
      // Por ahora solo guardamos en localStorage para demostración
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.email === email);
      
      if (userIndex !== -1) {
        users[userIndex].password = newPassword; // En producción, esto debería estar hasheado
        localStorage.setItem('users', JSON.stringify(users));
      }
      
      // Marcar código como usado
      markResetCodeAsUsed(email);
      
      setSuccess('Contraseña restablecida exitosamente');
      
      // Limpiar código después de un tiempo
      setTimeout(() => {
        clearResetCode(email);
      }, 1000);
      
    } catch (err) {
      console.error('Error en resetPassword:', err);
      setError('Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    updateUser,
    loading,
    isInitializing,
    error,
    success,
    requestPasswordReset,
    resetPassword,
    clearMessages
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};