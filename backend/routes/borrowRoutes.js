const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  crearPrestamo,
  obtenerPrestamos,
  obtenerPrestamoPorId,
  devolverLibro,
  renovarPrestamo,
  marcarComoPerdido,
  obtenerPrestamosVencidos,
  obtenerPrestamosPorUsuario,
  obtenerEstadisticasPrestamos
} = require('../controllers/borrowController');

// Middleware de autenticación (opcional, dependiendo de tus necesidades)
// const { authenticateToken } = require('../middleware/auth');

// Validaciones para crear préstamo
const validacionPrestamo = [
  body('userId')
    .notEmpty()
    .withMessage('El ID del usuario es requerido')
    .isMongoId()
    .withMessage('El ID del usuario debe ser válido'),
  body('bookId')
    .notEmpty()
    .withMessage('El ID del libro es requerido')
    .isMongoId()
    .withMessage('El ID del libro debe ser válido'),
  body('dueDate')
    .notEmpty()
    .withMessage('La fecha de vencimiento es requerida')
    .isISO8601()
    .withMessage('La fecha de vencimiento debe ser válida')
    .custom((value) => {
      const dueDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate <= today) {
        throw new Error('La fecha de vencimiento debe ser futura');
      }
      
      // Máximo 30 días de préstamo
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 30);
      
      if (dueDate > maxDate) {
        throw new Error('La fecha de vencimiento no puede ser mayor a 30 días');
      }
      
      return true;
    }),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
];

// Validaciones para devolución
const validacionDevolucion = [
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
];

// Validaciones para renovación
const validacionRenovacion = [
  body('additionalDays')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Los días adicionales deben ser entre 1 y 30')
];

// Rutas públicas (para consulta de préstamos)
router.get('/', obtenerPrestamos);                                    // GET /api/borrows - Obtener todos los préstamos con filtros y paginación
router.get('/stats', obtenerEstadisticasPrestamos);                   // GET /api/borrows/stats - Obtener estadísticas de préstamos
router.get('/overdue', obtenerPrestamosVencidos);                     // GET /api/borrows/overdue - Obtener préstamos vencidos
router.get('/user/:userId', obtenerPrestamosPorUsuario);              // GET /api/borrows/user/:userId - Obtener préstamos por usuario
router.get('/:id', obtenerPrestamoPorId);                             // GET /api/borrows/:id - Obtener un préstamo por ID

// Rutas protegidas (para administración de préstamos)
// Si quieres proteger estas rutas, descomenta la línea del middleware de autenticación arriba
// y agrega authenticateToken como segundo parámetro en cada ruta

router.post('/', validacionPrestamo, crearPrestamo);                  // POST /api/borrows - Crear un nuevo préstamo
router.patch('/:id/return', validacionDevolucion, devolverLibro);     // PATCH /api/borrows/:id/return - Devolver un libro
router.patch('/:id/renew', validacionRenovacion, renovarPrestamo);    // PATCH /api/borrows/:id/renew - Renovar un préstamo
router.patch('/:id/lost', validacionDevolucion, marcarComoPerdido);   // PATCH /api/borrows/:id/lost - Marcar libro como perdido

module.exports = router;