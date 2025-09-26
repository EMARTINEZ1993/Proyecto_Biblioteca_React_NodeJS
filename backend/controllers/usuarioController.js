const Usuario = require('../models/Usuario');
const { validationResult } = require('express-validator');

// Crear nuevo usuario
const crearUsuario = async (req, res) => {
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

    const { id_type, id, name, lastname, phone, address, email, birthDate, gender } = req.body;

    // Verificar si ya existe un usuario con esa identificación o email
    const usuarioExistente = await Usuario.findOne({
      $or: [{ id }, { email }]
    });

    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con esa identificación o email'
      });
    }

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      id_type,
      id,
      name,
      lastname,
      phone,
      address,
      email,
      birthDate,
      gender
    });

    await nuevoUsuario.save();

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: nuevoUsuario
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    // Construir filtro de búsqueda
    const filtro = {};
    if (search) {
      filtro.$or = [
        { name: { $regex: search, $options: 'i' } },
        { lastname: { $regex: search, $options: 'i' } },
        { id: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const usuarios = await Usuario.find(filtro)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Usuario.countDocuments(filtro);

    res.json({
      success: true,
      data: usuarios,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuario = await Usuario.findById(id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario
    });

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
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
    const { id_type, id: identificacion, name, lastname, phone, address, email, birthDate, gender } = req.body;

    // Verificar si el usuario existe
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si la nueva identificación o email ya existen en otro usuario
    if (identificacion !== usuario.id || email !== usuario.email) {
      const usuarioExistente = await Usuario.findOne({
        _id: { $ne: id },
        $or: [{ id: identificacion }, { email }]
      });

      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro usuario con esa identificación o email'
        });
      }
    }

    // Actualizar usuario
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      {
        id_type,
        id: identificacion,
        name,
        lastname,
        phone,
        address,
        email,
        birthDate,
        gender
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuarioActualizado
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar usuario
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await Usuario.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de usuarios
const obtenerEstadisticas = async (req, res) => {
  try {
    const totalUsuarios = await Usuario.countDocuments();
    
    // Estadísticas por tipo de identificación
    const estadisticasTipo = await Usuario.aggregate([
      {
        $group: {
          _id: '$id_type',
          cantidad: { $sum: 1 }
        }
      },
      {
        $project: {
          tipo: '$_id',
          cantidad: 1,
          _id: 0
        }
      }
    ]);

    // Estadísticas por género
    const estadisticasGenero = await Usuario.aggregate([
      {
        $group: {
          _id: '$gender',
          cantidad: { $sum: 1 }
        }
      },
      {
        $project: {
          genero: '$_id',
          cantidad: 1,
          _id: 0
        }
      }
    ]);

    // Estadísticas por apellido
    const estadisticasApellido = await Usuario.aggregate([
      {
        $group: {
          _id: '$lastname',
          cantidad: { $sum: 1 }
        }
      },
      {
        $project: {
          apellido: '$_id',
          cantidad: 1,
          _id: 0
        }
      },
      {
        $sort: { cantidad: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        totalUsuarios,
        estadisticasTipo,
        estadisticasGenero,
        estadisticasApellido
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
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  obtenerEstadisticas
};