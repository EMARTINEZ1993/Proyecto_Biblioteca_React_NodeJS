const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  crearAutor,
  obtenerAutores,
  obtenerAutorPorId,
  actualizarAutor,
  eliminarAutor,
  restaurarAutor,
  obtenerAutoresPorGenero,
  obtenerAutoresPorNacionalidad,
  obtenerEstadisticasAutores
} = require('../controllers/authorController');

// Validaciones para crear/actualizar autor
const validacionesAutor = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('El apellido es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),

  body('nationality')
    .notEmpty()
    .withMessage('La nacionalidad es obligatoria')
    .isIn([
      'colombiana', 'ecuatoriana', 'peruana', 'venezolana', 'argentina', 
      'chilena', 'mexicana', 'española', 'francesa', 'italiana', 
      'alemana', 'inglesa', 'estadounidense', 'brasileña', 'otra'
    ])
    .withMessage('Nacionalidad no válida'),

  body('genres')
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos un género literario')
    .custom((genres) => {
      const validGenres = [
        'ficcion', 'no-ficcion', 'ciencia', 'tecnologia', 'fantasia',
        'romance', 'misterio', 'thriller', 'horror', 'aventura',
        'biografia', 'historia', 'filosofia', 'poesia', 'drama',
        'comedia', 'ciencia-ficcion', 'realismo-magico', 'novela-historica',
        'literatura-infantil', 'literatura-juvenil', 'ensayo', 'cronica'
      ];
      
      const invalidGenres = genres.filter(genre => !validGenres.includes(genre));
      if (invalidGenres.length > 0) {
        throw new Error(`Géneros no válidos: ${invalidGenres.join(', ')}`);
      }
      return true;
    }),

  body('biography')
    .trim()
    .notEmpty()
    .withMessage('La biografía es obligatoria')
    .isLength({ min: 50, max: 2000 })
    .withMessage('La biografía debe tener entre 50 y 2000 caracteres'),

  body('photo')
    .notEmpty()
    .withMessage('La fotografía es obligatoria')
    .custom((value) => {
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      const base64Pattern = /^data:image\/.+;base64,/;
      
      if (!urlPattern.test(value) && !base64Pattern.test(value)) {
        throw new Error('Debe ser una URL válida de imagen o imagen en base64');
      }
      return true;
    }),

  body('language')
    .notEmpty()
    .withMessage('El idioma principal es obligatorio')
    .isIn(['es', 'en', 'fr', 'pt', 'de', 'it', 'otro'])
    .withMessage('Idioma no válido'),

  body('works')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las obras no pueden exceder 1000 caracteres'),

  body('awards')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Los premios no pueden exceder 1000 caracteres'),

  body('socialLinks')
    .optional()
    .trim()
    .isURL()
    .withMessage('Debe ser una URL válida'),

  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de nacimiento no válida')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('La fecha de nacimiento no puede ser futura');
      }
      return true;
    }),

  body('deathDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fallecimiento no válida')
    .custom((value, { req }) => {
      const deathDate = new Date(value);
      const birthDate = req.body.birthDate ? new Date(req.body.birthDate) : null;
      
      if (deathDate > new Date()) {
        throw new Error('La fecha de fallecimiento no puede ser futura');
      }
      
      if (birthDate && deathDate <= birthDate) {
        throw new Error('La fecha de fallecimiento debe ser posterior a la fecha de nacimiento');
      }
      
      return true;
    })
];

// Validaciones para actualización (campos opcionales)
const validacionesActualizacion = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),

  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El apellido no puede estar vacío')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),

  body('nationality')
    .optional()
    .isIn([
      'colombiana', 'ecuatoriana', 'peruana', 'venezolana', 'argentina', 
      'chilena', 'mexicana', 'española', 'francesa', 'italiana', 
      'alemana', 'inglesa', 'estadounidense', 'brasileña', 'otra'
    ])
    .withMessage('Nacionalidad no válida'),



  body('biography')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La biografía no puede estar vacía')
    .isLength({ min: 50, max: 2000 })
    .withMessage('La biografía debe tener entre 50 y 2000 caracteres'),

  body('photo')
    .optional()
    .custom((value) => {
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      const base64Pattern = /^data:image\/.+;base64,/;
      
      if (!urlPattern.test(value) && !base64Pattern.test(value)) {
        throw new Error('Debe ser una URL válida de imagen o imagen en base64');
      }
      return true;
    }),

  body('language')
    .optional()
    .isIn(['es', 'en', 'fr', 'de', 'it', 'pt', 'other'])
    .withMessage('Idioma no válido'),

  body('works')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las obras no pueden exceder 1000 caracteres'),

  body('awards')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Los premios no pueden exceder 1000 caracteres'),

  body('socialLinks')
    .optional()
    .trim()
    .isURL()
    .withMessage('Debe ser una URL válida'),

  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de nacimiento no válida')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('La fecha de nacimiento no puede ser futura');
      }
      return true;
    }),

  body('deathDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fallecimiento no válida')
    .custom((value, { req }) => {
      const deathDate = new Date(value);
      const birthDate = req.body.birthDate ? new Date(req.body.birthDate) : null;
      
      if (deathDate > new Date()) {
        throw new Error('La fecha de fallecimiento no puede ser futura');
      }
      
      if (birthDate && deathDate <= birthDate) {
        throw new Error('La fecha de fallecimiento debe ser posterior a la fecha de nacimiento');
      }
      
      return true;
    })
];

// RUTAS PRINCIPALES

// GET /api/authors - Obtener todos los autores con filtros y paginación
router.get('/', obtenerAutores);

// GET /api/authors/stats - Obtener estadísticas de autores
router.get('/stats', obtenerEstadisticasAutores);

// GET /api/authors/genre/:genero - Obtener autores por género
router.get('/genre/:genero', obtenerAutoresPorGenero);

// GET /api/authors/nationality/:nacionalidad - Obtener autores por nacionalidad
router.get('/nationality/:nacionalidad', obtenerAutoresPorNacionalidad);



// GET /api/authors/:id - Obtener autor por ID (debe ir al final)
router.get('/:id', obtenerAutorPorId);

// POST /api/authors - Crear nuevo autor
router.post('/', validacionesAutor, crearAutor);

// PUT /api/authors/:id - Actualizar autor
router.put('/:id', validacionesActualizacion, actualizarAutor);

// DELETE /api/authors/:id - Eliminar autor (soft delete)
router.delete('/:id', eliminarAutor);

// PATCH /api/authors/:id/restore - Restaurar autor eliminado
router.patch('/:id/restore', restaurarAutor);

module.exports = router;