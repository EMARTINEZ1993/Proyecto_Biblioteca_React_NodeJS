// src/utils/validators.js

/**
 * Utilidades de validación para formularios
 */

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'El email es requerido' };
  }
  
  if (typeof email !== 'string') {
    return { isValid: false, message: 'El email debe ser una cadena de texto' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, message: 'Formato de email inválido' };
  }
  
  if (email.length > 254) {
    return { isValid: false, message: 'El email es demasiado largo' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida fortaleza de contraseña
 * @param {string} password - Contraseña a validar
 * @param {Object} options - Opciones de validación
 * @returns {Object} { isValid: boolean, message: string, strength: string }
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumbers = false,
    requireSpecialChars = false,
    maxLength = 128
  } = options;
  
  if (!password) {
    return { isValid: false, message: 'La contraseña es requerida', strength: 'none' };
  }
  
  if (typeof password !== 'string') {
    return { isValid: false, message: 'La contraseña debe ser una cadena de texto', strength: 'none' };
  }
  
  if (password.length < minLength) {
    return { 
      isValid: false, 
      message: `La contraseña debe tener al menos ${minLength} caracteres`, 
      strength: 'weak' 
    };
  }
  
  if (password.length > maxLength) {
    return { 
      isValid: false, 
      message: `La contraseña no puede tener más de ${maxLength} caracteres`, 
      strength: 'none' 
    };
  }
  
  const errors = [];
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('al menos una letra mayúscula');
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('al menos una letra minúscula');
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    errors.push('al menos un número');
  }
  
  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('al menos un carácter especial');
  }
  
  if (errors.length > 0) {
    return {
      isValid: false,
      message: `La contraseña debe contener ${errors.join(', ')}`,
      strength: 'weak'
    };
  }
  
  // Calcular fortaleza
  const strength = calculatePasswordStrength(password);
  
  return { isValid: true, message: '', strength };
};

/**
 * Calcula la fortaleza de una contraseña
 * @param {string} password - Contraseña a evaluar
 * @returns {string} 'weak' | 'medium' | 'strong' | 'very-strong'
 */
export const calculatePasswordStrength = (password) => {
  if (!password) return 'none';
  
  let score = 0;
  
  // Longitud
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Tipos de caracteres
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  
  // Variedad
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score += 1;
  
  // Patrones comunes (penalización)
  if (/123|abc|qwe|password|admin/i.test(password)) score -= 2;
  
  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  if (score <= 6) return 'strong';
  return 'very-strong';
};

/**
 * Valida que las contraseñas coincidan
 * @param {string} password - Contraseña original
 * @param {string} confirmPassword - Confirmación de contraseña
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Confirma tu contraseña' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Las contraseñas no coinciden' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida código de recuperación
 * @param {string} code - Código a validar
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateResetCode = (code) => {
  if (!code) {
    return { isValid: false, message: 'El código es requerido' };
  }
  
  if (typeof code !== 'string') {
    return { isValid: false, message: 'El código debe ser una cadena de texto' };
  }
  
  const cleanCode = code.trim();
  
  if (cleanCode.length !== 6) {
    return { isValid: false, message: 'El código debe tener 6 dígitos' };
  }
  
  if (!/^\d{6}$/.test(cleanCode)) {
    return { isValid: false, message: 'El código debe contener solo números' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida nombre de usuario
 * @param {string} username - Nombre de usuario a validar
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateUsername = (username) => {
  if (!username) {
    return { isValid: false, message: 'El nombre de usuario es requerido' };
  }
  
  if (typeof username !== 'string') {
    return { isValid: false, message: 'El nombre de usuario debe ser una cadena de texto' };
  }
  
  const cleanUsername = username.trim();
  
  if (cleanUsername.length < 3) {
    return { isValid: false, message: 'El nombre de usuario debe tener al menos 3 caracteres' };
  }
  
  if (cleanUsername.length > 30) {
    return { isValid: false, message: 'El nombre de usuario no puede tener más de 30 caracteres' };
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
    return { isValid: false, message: 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida formulario completo
 * @param {Object} formData - Datos del formulario
 * @param {Array} rules - Reglas de validación
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;
  
  for (const [field, validators] of Object.entries(rules)) {
    const value = formData[field];
    
    for (const validator of validators) {
      const result = validator(value, formData);
      
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
        break; // Solo mostrar el primer error por campo
      }
    }
  }
  
  return { isValid, errors };
};

/**
 * Sanitiza entrada de texto
 * @param {string} input - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>"'&]/g, '') // Remover caracteres peligrosos
    .substring(0, 1000); // Limitar longitud
};

/**
 * Validadores predefinidos para uso común
 */
export const commonValidators = {
  email: validateEmail,
  password: (password) => validatePassword(password, { minLength: 6 }),
  strongPassword: (password) => validatePassword(password, {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  }),
  resetCode: validateResetCode,
  username: validateUsername
};