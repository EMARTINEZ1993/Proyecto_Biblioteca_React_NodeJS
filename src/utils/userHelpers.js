// src/utils/userHelpers.js

/**
 * Verifica si un email existe en el sistema
 * @param {string} email - Email a verificar
 * @returns {boolean} - true si el email existe, false si no
 */
export const emailExists = (email) => {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  } catch (error) {
    console.error('Error al verificar email:', error);
    return false;
  }
};

/**
 * Obtiene un usuario por su email
 * @param {string} email - Email del usuario
 * @returns {object|null} - Usuario encontrado o null
 */
export const getUserByEmail = (email) => {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
};

/**
 * Obtiene todos los usuarios registrados
 * @returns {array} - Array de usuarios
 */
export const getAllUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('users') || '[]');
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
};