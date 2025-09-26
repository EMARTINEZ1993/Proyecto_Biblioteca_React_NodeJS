const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Crear nuevo préstamo
const crearPrestamo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { userId, bookId, dueDate, notes } = req.body;

    // Verificar que el usuario existe
    const usuario = await User.findById(userId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar que el libro existe y está disponible
    const libro = await Book.findById(bookId);
    if (!libro) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    if (!libro.isActive) {
      return res.status(400).json({
        success: false,
        message: 'El libro no está disponible'
      });
    }

    // Verificar que el libro no esté ya prestado
    const prestamoExistente = await Borrow.findOne({
      book: bookId,
      status: { $in: ['active', 'overdue'] },
      isActive: true
    });

    if (prestamoExistente) {
      return res.status(400).json({
        success: false,
        message: 'El libro ya está prestado'
      });
    }

    // Verificar límite de préstamos por usuario (máximo 5 libros activos)
    const prestamosActivos = await Borrow.countDocuments({
      user: userId,
      status: { $in: ['active', 'overdue'] },
      isActive: true
    });

    if (prestamosActivos >= 5) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ha alcanzado el límite máximo de préstamos (5 libros)'
      });
    }

    // Crear nuevo préstamo
    const nuevoPrestamo = new Borrow({
      user: userId,
      book: bookId,
      dueDate: new Date(dueDate),
      notes: notes || ''
    });

    await nuevoPrestamo.save();

    // Poblar los datos para la respuesta
    await nuevoPrestamo.populate([
      { path: 'user', select: 'username email firstName lastName' },
      { path: 'book', select: 'title author isbn coverImage' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Préstamo creado exitosamente',
      data: nuevoPrestamo
    });

  } catch (error) {
    console.error('Error al crear préstamo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los préstamos con filtros y paginación
const obtenerPrestamos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = '',
      userId = '',
      bookId = '',
      search = '',
      sortBy = 'borrowDate',
      sortOrder = 'desc'
    } = req.query;

    // Construir filtros
    const filtros = { isActive: true };

    if (status) {
      filtros.status = status;
    }

    if (userId) {
      filtros.user = userId;
    }

    if (bookId) {
      filtros.book = bookId;
    }

    // Configurar paginación
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Configurar ordenamiento
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Construir pipeline de agregación para búsqueda
    let pipeline = [
      { $match: filtros }
    ];

    // Si hay búsqueda, agregar lookup y match
    if (search) {
      pipeline = [
        { $match: filtros },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $lookup: {
            from: 'books',
            localField: 'book',
            foreignField: '_id',
            as: 'bookInfo'
          }
        },
        {
          $match: {
            $or: [
              { 'userInfo.username': { $regex: search, $options: 'i' } },
              { 'userInfo.email': { $regex: search, $options: 'i' } },
              { 'userInfo.firstName': { $regex: search, $options: 'i' } },
              { 'userInfo.lastName': { $regex: search, $options: 'i' } },
              { 'bookInfo.title': { $regex: search, $options: 'i' } },
              { 'bookInfo.author': { $regex: search, $options: 'i' } },
              { 'bookInfo.isbn': { $regex: search, $options: 'i' } }
            ]
          }
        }
      ];
    }

    // Agregar ordenamiento, skip y limit
    pipeline.push(
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limitNum }
    );

    // Ejecutar agregación
    const prestamos = await Borrow.aggregate(pipeline);

    // Poblar los datos
    await Borrow.populate(prestamos, [
      { path: 'user', select: 'username email firstName lastName' },
      { path: 'book', select: 'title author isbn coverImage genre' }
    ]);

    // Contar total de documentos
    const totalPipeline = pipeline.slice(0, -3); // Remover sort, skip, limit
    const totalResult = await Borrow.aggregate([
      ...totalPipeline,
      { $count: 'total' }
    ]);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: prestamos,
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
    console.error('Error al obtener préstamos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener préstamo por ID
const obtenerPrestamoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const prestamo = await Borrow.findById(id)
      .populate('user', 'username email firstName lastName')
      .populate('book', 'title author isbn coverImage genre description');

    if (!prestamo) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado'
      });
    }

    res.json({
      success: true,
      data: prestamo
    });

  } catch (error) {
    console.error('Error al obtener préstamo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Devolver libro
const devolverLibro = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const prestamo = await Borrow.findById(id);

    if (!prestamo) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado'
      });
    }

    if (prestamo.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'El libro ya ha sido devuelto'
      });
    }

    if (prestamo.status === 'lost') {
      return res.status(400).json({
        success: false,
        message: 'El libro está marcado como perdido'
      });
    }

    // Devolver el libro
    await prestamo.returnBook(notes);

    // Poblar los datos para la respuesta
    await prestamo.populate([
      { path: 'user', select: 'username email firstName lastName' },
      { path: 'book', select: 'title author isbn coverImage' }
    ]);

    res.json({
      success: true,
      message: 'Libro devuelto exitosamente',
      data: prestamo
    });

  } catch (error) {
    console.error('Error al devolver libro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Renovar préstamo
const renovarPrestamo = async (req, res) => {
  try {
    const { id } = req.params;
    const { additionalDays = 14 } = req.body;

    const prestamo = await Borrow.findById(id);

    if (!prestamo) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado'
      });
    }

    // Renovar el préstamo
    await prestamo.renewLoan(additionalDays);

    // Poblar los datos para la respuesta
    await prestamo.populate([
      { path: 'user', select: 'username email firstName lastName' },
      { path: 'book', select: 'title author isbn coverImage' }
    ]);

    res.json({
      success: true,
      message: 'Préstamo renovado exitosamente',
      data: prestamo
    });

  } catch (error) {
    console.error('Error al renovar préstamo:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Marcar libro como perdido
const marcarComoPerdido = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const prestamo = await Borrow.findById(id);

    if (!prestamo) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado'
      });
    }

    if (prestamo.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'No se puede marcar como perdido un libro ya devuelto'
      });
    }

    prestamo.status = 'lost';
    if (notes) {
      prestamo.notes = notes;
    }

    await prestamo.save();

    // Poblar los datos para la respuesta
    await prestamo.populate([
      { path: 'user', select: 'username email firstName lastName' },
      { path: 'book', select: 'title author isbn coverImage' }
    ]);

    res.json({
      success: true,
      message: 'Libro marcado como perdido',
      data: prestamo
    });

  } catch (error) {
    console.error('Error al marcar libro como perdido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener préstamos vencidos
const obtenerPrestamosVencidos = async (req, res) => {
  try {
    const prestamosVencidos = await Borrow.findOverdueLoans();

    res.json({
      success: true,
      data: prestamosVencidos,
      count: prestamosVencidos.length
    });

  } catch (error) {
    console.error('Error al obtener préstamos vencidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener préstamos por usuario
const obtenerPrestamosPorUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status = 'all' } = req.query;

    let filtros = { user: userId, isActive: true };

    if (status !== 'all') {
      filtros.status = status;
    }

    const prestamos = await Borrow.find(filtros)
      .populate('book', 'title author isbn coverImage genre')
      .sort({ borrowDate: -1 });

    res.json({
      success: true,
      data: prestamos,
      count: prestamos.length
    });

  } catch (error) {
    console.error('Error al obtener préstamos por usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de préstamos
const obtenerEstadisticasPrestamos = async (req, res) => {
  try {
    const estadisticas = await Borrow.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalPrestamos = await Borrow.countDocuments({ isActive: true });
    const prestamosVencidos = await Borrow.countDocuments({ 
      status: 'overdue', 
      isActive: true 
    });

    // Préstamos por mes (últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const prestamosPorMes = await Borrow.aggregate([
      {
        $match: {
          borrowDate: { $gte: seisMesesAtras },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$borrowDate' },
            month: { $month: '$borrowDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        estadisticasPorEstado: estadisticas,
        totalPrestamos,
        prestamosVencidos,
        prestamosPorMes
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
  crearPrestamo,
  obtenerPrestamos,
  obtenerPrestamoPorId,
  devolverLibro,
  renovarPrestamo,
  marcarComoPerdido,
  obtenerPrestamosVencidos,
  obtenerPrestamosPorUsuario,
  obtenerEstadisticasPrestamos
};