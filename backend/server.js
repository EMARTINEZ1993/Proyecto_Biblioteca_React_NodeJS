// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
require('dotenv').config();

// Importar configuración de base de datos
const connectDB = require('./config/database');

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const authorRoutes = require('./routes/authorRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowRoutes = require('./routes/borrowRoutes');

// Importar middlewares
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Conectar a la base de datos
connectDB();

// Crear aplicación Express
const app = express();

// Configurar CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares de seguridad
app.use(helmet()); // Configurar headers de seguridad
app.use(cors(corsOptions)); // Habilitar CORS
app.use(mongoSanitize()); // Prevenir inyección NoSQL
app.use(xss()); // Limpiar entrada del usuario de HTML malicioso
app.use(hpp()); // Prevenir contaminación de parámetros HTTP

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // límite de 100 requests por ventana de tiempo
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Autenticación - Backend funcionando',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      usuarios: '/api/usuarios',
      authors: '/api/authors',
      books: '/api/books',
      documentation: '/api/docs' // Para futuro
    }
  });
});

// Middleware para rutas no encontradas
app.use(notFound);

// Middleware de manejo de errores
app.use(errorHandler);

// Puerto del servidor
const PORT = process.env.PORT || 5001;

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error no manejado: ${err.message}`);
  // Cerrar servidor y salir del proceso
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log(`Excepción no capturada: ${err.message}`);
  process.exit(1);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM recibido. Cerrando servidor HTTP...');
  server.close(() => {
    console.log('💀 Proceso HTTP terminado');
  });
});

module.exports = app;