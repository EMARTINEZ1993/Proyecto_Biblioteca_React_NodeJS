// src/services/emailService.js
import emailjs from '@emailjs/browser';

// Configuración de EmailJS
const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
  fromName: import.meta.env.VITE_FROM_NAME || "Sistema de Recuperación",
  fromEmail: import.meta.env.VITE_FROM_EMAIL || "noreply@tuapp.com"
};

// Debug: Mostrar configuración
console.log('🔧 EmailJS Config:', {
  serviceId: EMAILJS_CONFIG.serviceId,
  templateId: EMAILJS_CONFIG.templateId,
  publicKey: EMAILJS_CONFIG.publicKey ? '✅ Configurada' : '❌ Faltante',
  fromEmail: EMAILJS_CONFIG.fromEmail
});

// Verificar si EmailJS está configurado
const isEmailJSConfigured = () => {
  return EMAILJS_CONFIG.serviceId && 
         EMAILJS_CONFIG.templateId && 
         EMAILJS_CONFIG.publicKey &&
         !EMAILJS_CONFIG.serviceId.includes('tu-service') &&
         !EMAILJS_CONFIG.templateId.includes('tu-template') &&
         !EMAILJS_CONFIG.publicKey.includes('tu-public');
};

// Inicializar EmailJS
if (isEmailJSConfigured()) {
  emailjs.init(EMAILJS_CONFIG.publicKey);
  console.log('✅ EmailJS inicializado');
}

/**
 * Genera un código de recuperación aleatorio
 */
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Envía email de recuperación de contraseña usando EmailJS
 */
export const sendPasswordResetEmail = async (email) => {
  try {
    console.log("📧 Intentando enviar email REAL a:", email);

    // Validar email
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }

    // Verificar configuración
    if (!isEmailJSConfigured()) {
      console.warn("⚠️ EmailJS no configurado. Usando simulación.");
      return await sendSimulatedEmail(email);
    }

    // Generar código
    const resetCode = generateResetCode();
    
    // Guardar en localStorage
    const resetData = {
      email,
      code: resetCode,
      timestamp: Date.now(),
      used: false
    };
    
    localStorage.setItem(`reset_${email}`, JSON.stringify(resetData));
    
    // --- PARÁMETROS ACTUALIZADOS CON TODAS LAS VARIABLES POSIBLES ---
    const templateParams = {
      // Todas las posibles variables para el destinatario
      to_email: email,
      email: email,
      user_email: email,
      to: email,
      recipient: email,
      user: email,
      
      // Todas las posibles variables para el código
      reset_code: resetCode,
      code: resetCode,
      verification_code: resetCode,
      token: resetCode,
      password_code: resetCode,
      reset_token: resetCode,
      
      // Variables para el nombre
      to_name: email.split('@')[0],
      user_name: email.split('@')[0],
      name: email.split('@')[0],
      first_name: email.split('@')[0],
      
      // Variables del remitente
      from_name: EMAILJS_CONFIG.fromName,
      from_email: EMAILJS_CONFIG.fromEmail,
      sender_name: EMAILJS_CONFIG.fromName,
      sender_email: EMAILJS_CONFIG.fromEmail,
      
      // Otras variables comunes
      expiry_time: '15 minutos',
      expiration: '15 minutos',
      time_limit: '15 minutos',
      app_name: 'Sistema de Recuperación',
      company_name: 'Tu Aplicación'
    };
    
    console.log("🚀 Enviando email REAL con parámetros:", {
      ...templateParams,
      reset_code: '******' // Ocultar código por seguridad
    });
    
    // ENVÍO REAL con EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );
    
    console.log("✅ Email ENVIADO REALMENTE. Status:", response.status);
    
    return {
      success: true,
      message: `✅ Código de recuperación enviado a ${email}. Revisa tu bandeja de entrada.`,
      isSimulated: false
    };
    
  } catch (error) {
    console.error("❌ Error enviando email REAL:", error);
    
    let errorMessage = 'Error al enviar el email';
    
    if (error.text) {
      errorMessage = error.text;
      console.error("❌ Error de EmailJS:", error.text);
    }
    
    // Usar simulación como fallback
    console.warn("⚠️ Falló envío real, usando simulación");
    return await sendSimulatedEmail(email);
  }
};

// Función de simulación
const sendSimulatedEmail = async (email) => {
  const resetCode = generateResetCode();
  
  const resetData = {
    email,
    code: resetCode,
    timestamp: Date.now(),
    used: false
  };
  
  localStorage.setItem(`reset_${email}`, JSON.stringify(resetData));
  
  console.log("📨 MODO SIMULACIÓN - Código:", resetCode);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: `[SIMULACIÓN] Código: ${resetCode}. Configure EmailJS para envíos reales.`,
    code: resetCode,
    isSimulated: true
  };
};

/**
 * Verifica código de recuperación
 */
export const verifyResetCode = (email, code) => {
  const resetData = localStorage.getItem(`reset_${email}`);
  
  if (!resetData) return false;
  
  try {
    const data = JSON.parse(resetData);
    
    if (data.used) return false;
    
    // Verificar expiración (15 minutos)
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;
    
    if (now - data.timestamp > fifteenMinutes) {
      localStorage.removeItem(`reset_${email}`);
      return false;
    }
    
    return data.code === code;
    
  } catch (error) {
    console.error('Error verificando código:', error);
    return false;
  }
};

/**
 * Marca código como usado
 */
export const markResetCodeAsUsed = (email) => {
  const resetData = localStorage.getItem(`reset_${email}`);
  
  if (resetData) {
    try {
      const data = JSON.parse(resetData);
      data.used = true;
      localStorage.setItem(`reset_${email}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error marcando código como usado:', error);
    }
  }
};

/**
 * Limpia código de recuperación
 */
export const clearResetCode = (email) => {
  localStorage.removeItem(`reset_${email}`);
};

/**
 * Función para descubrir las variables correctas del template
 */
export const debugEmailJSTemplate = async () => {
  console.log('🔍 Debug: Probando variables comunes...');
  
  const testVariables = [
    { to_email: 'test@example.com', reset_code: '123456' },
    { email: 'test@example.com', code: '123456' },
    { user_email: 'test@example.com', verification_code: '123456' },
    { to: 'test@example.com', resetCode: '123456' },
    { recipient: 'test@example.com', token: '123456' }
  ];
  
  for (let i = 0; i < testVariables.length; i++) {
    try {
      console.log(`🧪 Probando conjunto ${i + 1}:`, testVariables[i]);
      
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        testVariables[i]
      );
      
      console.log(`✅ ¡ÉXITO! Variables correctas:`, Object.keys(testVariables[i]));
      return { success: true, variables: testVariables[i] };
      
    } catch (error) {
      console.log(`❌ Conjunto ${i + 1} falló:`, error.text || error.message);
    }
  }
  
  return { success: false, message: 'Ningún conjunto de variables funcionó' };
};

/**
 * Función para probar EmailJS inmediatamente
 */
export const testEmailJSSend = async (testEmail = 'eliana.ingeniera@gmail.com') => {
  console.log('🧪 Probando envío REAL de email...');
  
  if (!isEmailJSConfigured()) {
    return { success: false, message: '❌ EmailJS no configurado' };
  }
  
  try {
    const testParams = {
      to_email: testEmail,
      email: testEmail,
      user_email: testEmail,
      to: testEmail,
      reset_code: '999999',
      code: '999999',
      verification_code: '999999',
      to_name: 'Eliana',
      user_name: 'Eliana',
      from_name: 'Sistema de Prueba',
      from_email: 'prueba@tuapp.com',
      expiry_time: '15 minutos'
    };
    
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      testParams
    );
    
    return {
      success: true,
      message: '✅ Email de prueba ENVIADO correctamente',
      response: response
    };
    
  } catch (error) {
    console.error('❌ Error en prueba:', error);
    return {
      success: false,
      message: `❌ Error: ${error.text || error.message}`,
      error: error
    };
  }
};