const Author = require('../models/Author');
const { validationResult } = require('express-validator');

// Crear nuevo autor
const crearAutor = async (req, res) => {
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
      name, 
      lastName, 
      nationality, 
      genres, 
      biography, 
      photo, 
      works, 
      awards, 
      language, 
      socialLinks,
      birthDate,
      deathDate
    } = req.body;

    // Verificar si ya existe un autor con el mismo nombre y apellido
    const autorExistente = await Author.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      lastName: { $regex: new RegExp(`^${lastName}$`, 'i') }
    });

    if (autorExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un autor con ese nombre y apellido'
      });
    }

    // Crear nuevo autor
    const nuevoAutor = new Author({
      name,
      lastName,
      nationality,
      genres,
      biography,
      photo,
      works,
      awards,
      language,
      socialLinks,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      deathDate: deathDate ? new Date(deathDate) : undefined
    });

    await nuevoAutor.save();

    res.status(201).json({
      success: true,
      message: 'Autor creado exitosamente',
      data: nuevoAutor
    });

  } catch (error) {
    console.error('Error al crear autor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los autores
const obtenerAutores = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      nationality, 
      genre, 
      language,
      isActive = 'true' 
    } = req.query;

    // Construir filtros
    const filtros = { isActive: isActive === 'true' };

    if (search) {
      filtros.$or = [
        { name: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { biography: { $regex: search, $options: 'i' } }
      ];
    }

    if (nationality) {
      filtros.nationality = nationality;
    }

    if (genre) {
      filtros.genres = { $in: [genre] };
    }

    if (language) {
      filtros.language = language;
    }

    // Calcular paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Obtener autores con paginación
    const autores = await Author.find(filtros)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Contar total de documentos
    const total = await Author.countDocuments(filtros);

    res.status(200).json({
      success: true,
      data: autores,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener autores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener autor por ID
const obtenerAutorPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const autor = await Author.findById(id);

    if (!autor) {
      return res.status(404).json({
        success: false,
        message: 'Autor no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: autor
    });

  } catch (error) {
    console.error('Error al obtener autor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar autor
const actualizarAutor = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const datosActualizacion = req.body;

    // Convertir fechas si están presentes
    if (datosActualizacion.birthDate) {
      datosActualizacion.birthDate = new Date(datosActualizacion.birthDate);
    }
    if (datosActualizacion.deathDate) {
      datosActualizacion.deathDate = new Date(datosActualizacion.deathDate);
    }

    // Verificar si existe otro autor con el mismo nombre (si se está cambiando)
    if (datosActualizacion.name || datosActualizacion.lastName) {
      const autorExistente = await Author.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${datosActualizacion.name || '.*'}$`, 'i') },
        lastName: { $regex: new RegExp(`^${datosActualizacion.lastName || '.*'}$`, 'i') }
      });

      if (autorExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro autor con ese nombre y apellido'
        });
      }
    }

    const autorActualizado = await Author.findByIdAndUpdate(
      id,
      datosActualizacion,
      { new: true, runValidators: true }
    );

    if (!autorActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Autor no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Autor actualizado exitosamente',
      data: autorActualizado
    });

  } catch (error) {
    console.error('Error al actualizar autor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar autor (soft delete)
const eliminarAutor = async (req, res) => {
  try {
    const { id } = req.params;

    const autor = await Author.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!autor) {
      return res.status(404).json({
        success: false,
        message: 'Autor no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Autor eliminado exitosamente',
      data: autor
    });

  } catch (error) {
    console.error('Error al eliminar autor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Restaurar autor
const restaurarAutor = async (req, res) => {
  try {
    const { id } = req.params;

    const autor = await Author.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!autor) {
      return res.status(404).json({
        success: false,
        message: 'Autor no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Autor restaurado exitosamente',
      data: autor
    });

  } catch (error) {
    console.error('Error al restaurar autor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener autores por género
const obtenerAutoresPorGenero = async (req, res) => {
  try {
    const { genero } = req.params;

    const autores = await Author.findByGenre(genero);

    res.status(200).json({
      success: true,
      data: autores,
      total: autores.length
    });

  } catch (error) {
    console.error('Error al obtener autores por género:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener autores por nacionalidad
const obtenerAutoresPorNacionalidad = async (req, res) => {
  try {
    const { nacionalidad } = req.params;

    const autores = await Author.findByNationality(nacionalidad);

    res.status(200).json({
      success: true,
      data: autores,
      total: autores.length
    });

  } catch (error) {
    console.error('Error al obtener autores por nacionalidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de autores
const obtenerEstadisticasAutores = async (req, res) => {
  try {
    const totalAutores = await Author.countDocuments({ isActive: true });
    const autoresInactivos = await Author.countDocuments({ isActive: false });

    // Estadísticas por nacionalidad
    const porNacionalidad = await Author.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$nationality', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Estadísticas por género literario
    const porGenero = await Author.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$genres' },
      { $group: { _id: '$genres', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Estadísticas por idioma
    const porIdioma = await Author.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totales: {
          activos: totalAutores,
          inactivos: autoresInactivos,
          total: totalAutores + autoresInactivos
        },
        porNacionalidad,
        porGenero,
        porIdioma
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
  crearAutor,
  obtenerAutores,
  obtenerAutorPorId,
  actualizarAutor,
  eliminarAutor,
  restaurarAutor,
  obtenerAutoresPorGenero,
  obtenerAutoresPorNacionalidad,
  obtenerEstadisticasAutores
};