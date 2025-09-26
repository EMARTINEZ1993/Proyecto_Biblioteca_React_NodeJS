const express = require('express');
const { body } = require('express-validator');
const {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  obtenerEstadisticas
} = require('../controllers/usuarioController');

const router = express.Router();

// Validaciones para crear/actualizar usuario
const usuarioValidation = [
  body('id_type')
    .notEmpty()
    .withMessage('El tipo de identificación es obligatorio')
    .isIn(['CC', 'TI', 'CE', 'NIT'])
    .withMessage('Tipo de identificación inválido'),
  
  body('id')
    .notEmpty()
    .withMessage('La identificación es obligatoria')
    .isLength({ min: 6, max: 12 })
    .withMessage('La identificación debe tener entre 6 y 12 caracteres')
    .matches(/^[0-9A-Za-z]+$/)
    .withMessage('La identificación solo puede contener números y letras'),
  
  body('name')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('lastname')
    .notEmpty()
    .withMessage('El apellido es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),
  
  body('phone')
    .notEmpty()
    .withMessage('El teléfono es obligatorio')
    .matches(/^[0-9]{7,15}$/)
    .withMessage('El teléfono debe contener entre 7 y 15 dígitos'),
  
  body('address')
    .notEmpty()
    .withMessage('La dirección es obligatoria')
    .isLength({ min: 5, max: 100 })
    .withMessage('La dirección debe tener entre 5 y 100 caracteres'),
  
  body('email')
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('El formato del email no es válido')
    .normalizeEmail(),
  
  body('birthDate')
    .notEmpty()
    .withMessage('La fecha de nacimiento es obligatoria')
    .isISO8601()
    .withMessage('Formato de fecha inválido')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 0 || age > 120) {
        throw new Error('La fecha de nacimiento no es válida');
      }
      
      return true;
    }),
  
  body('gender')
    .notEmpty()
    .withMessage('El género es obligatorio')
    .isIn(['Masculino', 'Femenino', 'Otro'])
    .withMessage('Género inválido')
];

// Rutas
router.post('/', usuarioValidation, crearUsuario);
router.get('/', obtenerUsuarios);
router.get('/estadisticas', obtenerEstadisticas);
router.get('/:id', obtenerUsuarioPorId);
router.put('/:id', usuarioValidation, actualizarUsuario);
router.delete('/:id', eliminarUsuario);

module.exports = router;