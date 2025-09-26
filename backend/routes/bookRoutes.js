const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  crearLibro,
  obtenerLibros,
  obtenerLibroPorId,
  actualizarLibro,
  eliminarLibro,
  restaurarLibro,
  obtenerLibrosPorGenero,
  obtenerLibrosPorIdioma,
  obtenerLibrosPorAutor,
  obtenerEstadisticasLibros
} = require('../controllers/bookController');

// Middleware de autenticación (opcional, dependiendo de tus necesidades)
// const { authenticateToken } = require('../middleware/auth');

// Validaciones para crear/actualizar libro
const validacionLibro = [
  body('title').notEmpty().withMessage('El título es requerido'),
  body('author').notEmpty().withMessage('El autor es requerido'),
  body('isbn').notEmpty().withMessage('El ISBN es requerido')
    .matches(/^(?:\d{10}|\d{13})$/).withMessage('El ISBN debe tener 10 o 13 dígitos'),
  body('publicationDate').isISO8601().withMessage('La fecha de publicación debe ser válida'),
  body('genre').isIn(['ficcion', 'no-ficcion', 'misterio', 'romance', 'ciencia-ficcion', 'fantasia', 'biografia', 'historia', 'ciencia', 'tecnologia', 'arte', 'religion', 'filosofia', 'poesia', 'drama', 'aventura', 'terror', 'humor', 'infantil', 'juvenil', 'educativo', 'referencia', 'otro']).withMessage('Género no válido'),
  body('language').isIn(['español', 'ingles', 'frances', 'aleman', 'italiano', 'portugues', 'chino', 'japones', 'ruso', 'arabe', 'otro']).withMessage('Idioma no válido'),
  body('pages').optional().isInt({ min: 1 }).withMessage('El número de páginas debe ser un entero positivo')
];

// Rutas públicas (para consulta de libros)
router.get('/', obtenerLibros);                           // GET /api/books - Obtener todos los libros con filtros y paginación
router.get('/stats', obtenerEstadisticasLibros);          // GET /api/books/stats - Obtener estadísticas de libros
router.get('/genero/:genero', obtenerLibrosPorGenero);    // GET /api/books/genero/:genero - Obtener libros por género
router.get('/idioma/:idioma', obtenerLibrosPorIdioma);    // GET /api/books/idioma/:idioma - Obtener libros por idioma
router.get('/autor/:autor', obtenerLibrosPorAutor);       // GET /api/books/autor/:autor - Obtener libros por autor
router.get('/:id', obtenerLibroPorId);                    // GET /api/books/:id - Obtener un libro por ID

// Rutas protegidas (para administración)
// Si quieres proteger estas rutas, descomenta la línea del middleware de autenticación arriba
// y agrega authenticateToken como segundo parámetro en cada ruta

router.post('/', validacionLibro, crearLibro);            // POST /api/books - Crear un nuevo libro
router.put('/:id', validacionLibro, actualizarLibro);     // PUT /api/books/:id - Actualizar un libro
router.delete('/:id', eliminarLibro);                     // DELETE /api/books/:id - Eliminar un libro (soft delete)
router.patch('/:id/restore', restaurarLibro);             // PATCH /api/books/:id/restore - Restaurar un libro eliminado

module.exports = router;