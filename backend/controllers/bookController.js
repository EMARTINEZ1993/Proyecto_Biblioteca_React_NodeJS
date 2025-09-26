const Book = require('../models/Book');
const { validationResult } = require('express-validator');

// Crear nuevo libro
const crearLibro = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const {
      title,
      author,
      isbn,
      publicationDate,
      genre,
      publisher,
      pages,
      language,
      description,
      coverImage
    } = req.body;

    // Verificar si ya existe un libro con el mismo ISBN
    const libroExistente = await Book.findOne({ isbn });
    if (libroExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un libro con este ISBN'
      });
    }

    // Crear nuevo libro
    const nuevoLibro = new Book({
      title,
      author,
      isbn,
      publicationDate: new Date(publicationDate),
      genre,
      publisher,
      pages,
      language,
      description,
      coverImage
    });

    await nuevoLibro.save();

    res.status(201).json({
      success: true,
      message: 'Libro creado exitosamente',
      data: nuevoLibro
    });

  } catch (error) {
    console.error('Error al crear libro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los libros con paginación y filtros
const obtenerLibros = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      genre = '',
      language = '',
      publisher = '',
      year = '',
      includeDeleted = 'false'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros
    let filters = {};
    
    if (includeDeleted !== 'true') {
      filters.isActive = true;
    }

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre) {
      filters.genre = genre;
    }

    if (language) {
      filters.language = language;
    }

    if (publisher) {
      filters.publisher = { $regex: publisher, $options: 'i' };
    }

    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      filters.publicationDate = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Ejecutar consulta con paginación
    const libros = await Book.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Book.countDocuments(filters);
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: libros,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error al obtener libros:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener un libro por ID
const obtenerLibroPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const libro = await Book.findById(id);

    if (!libro || !libro.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: libro
    });

  } catch (error) {
    console.error('Error al obtener libro:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de libro inválido'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar un libro
const actualizarLibro = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Convertir fecha de publicación si se proporciona
    if (updateData.publicationDate) {
      updateData.publicationDate = new Date(updateData.publicationDate);
    }

    // Verificar si el libro existe
    const libroExistente = await Book.findById(id);
    if (!libroExistente || libroExistente.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    // Si se está actualizando el ISBN, verificar que no exista otro libro con el mismo ISBN
    if (updateData.isbn && updateData.isbn !== libroExistente.isbn) {
      const libroConMismoISBN = await Book.findOne({ 
        isbn: updateData.isbn, 
        _id: { $ne: id },
        isDeleted: false 
      });
      
      if (libroConMismoISBN) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro libro con este ISBN'
        });
      }
    }

    const libroActualizado = await Book.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Libro actualizado exitosamente',
      data: libroActualizado
    });

  } catch (error) {
    console.error('Error al actualizar libro:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de libro inválido'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar un libro (soft delete)
const eliminarLibro = async (req, res) => {
  try {
    const { id } = req.params;

    const libro = await Book.findById(id);
    if (!libro || libro.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    await libro.softDelete();

    res.status(200).json({
      success: true,
      message: 'Libro eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar libro:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de libro inválido'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Restaurar un libro eliminado
const restaurarLibro = async (req, res) => {
  try {
    const { id } = req.params;

    const libro = await Book.findById(id);
    if (!libro) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    if (!libro.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'El libro no está eliminado'
      });
    }

    await libro.restore();

    res.status(200).json({
      success: true,
      message: 'Libro restaurado exitosamente',
      data: libro
    });

  } catch (error) {
    console.error('Error al restaurar libro:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de libro inválido'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener libros por género
const obtenerLibrosPorGenero = async (req, res) => {
  try {
    const { genero } = req.params;

    const libros = await Book.findByGenre(genero);

    res.status(200).json({
      success: true,
      data: libros,
      total: libros.length
    });

  } catch (error) {
    console.error('Error al obtener libros por género:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener libros por idioma
const obtenerLibrosPorIdioma = async (req, res) => {
  try {
    const { idioma } = req.params;

    const libros = await Book.findByLanguage(idioma);

    res.status(200).json({
      success: true,
      data: libros,
      total: libros.length
    });

  } catch (error) {
    console.error('Error al obtener libros por idioma:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener libros por autor
const obtenerLibrosPorAutor = async (req, res) => {
  try {
    const { autor } = req.params;

    const libros = await Book.findByAuthor(autor);

    res.status(200).json({
      success: true,
      data: libros,
      total: libros.length
    });

  } catch (error) {
    console.error('Error al obtener libros por autor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de libros
const obtenerEstadisticasLibros = async (req, res) => {
  try {
    const totalLibros = await Book.countDocuments({ isDeleted: false });
    const librosEliminados = await Book.countDocuments({ isDeleted: true });

    // Estadísticas por género
    const porGenero = await Book.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Estadísticas por idioma
    const porIdioma = await Book.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Estadísticas por editorial
    const porEditorial = await Book.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$publisher', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Libros recientes (últimos 5 años)
    const fechaLimite = new Date();
    fechaLimite.setFullYear(fechaLimite.getFullYear() - 5);
    
    const librosRecientes = await Book.countDocuments({
      isDeleted: false,
      publicationDate: { $gte: fechaLimite }
    });

    res.status(200).json({
      success: true,
      data: {
        totales: {
          activos: totalLibros,
          eliminados: librosEliminados,
          total: totalLibros + librosEliminados,
          recientes: librosRecientes
        },
        porGenero,
        porIdioma,
        porEditorial
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
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
};