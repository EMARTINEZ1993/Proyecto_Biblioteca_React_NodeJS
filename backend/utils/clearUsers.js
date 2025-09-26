// utils/clearUsers.js
// Script para limpiar todos los usuarios de la base de datos

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const clearUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const result = await User.deleteMany({});
    console.log(`🗑️ ${result.deletedCount} usuarios eliminados`);

    console.log('✅ Base de datos limpiada exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
};

clearUsers();