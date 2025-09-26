// utils/checkUsers.js
// Script para verificar usuarios registrados en MongoDB

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener todos los usuarios
    const users = await User.find({}).select('-password');
    
    console.log('\n📊 USUARIOS REGISTRADOS:');
    console.log('========================');
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios registrados');
    } else {
      console.log(`✅ Total de usuarios: ${users.length}\n`);
      
      users.forEach((user, index) => {
        console.log(`👤 Usuario ${index + 1}:`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Nombre: ${user.name}`);
        console.log(`   🆔 ID: ${user._id}`);
        console.log(`   📅 Registrado: ${user.createdAt}`);
        console.log(`   🔄 Última actualización: ${user.updatedAt}`);
        console.log(`   ✅ Activo: ${user.isActive ? 'Sí' : 'No'}`);
        if (user.lastLogin) {
          console.log(`   🕐 Último login: ${user.lastLogin}`);
        }
        console.log('   ─────────────────────────────');
      });
    }

    // Estadísticas adicionales
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    
    console.log('\n📈 ESTADÍSTICAS:');
    console.log('================');
    console.log(`👥 Total usuarios: ${users.length}`);
    console.log(`✅ Usuarios activos: ${activeUsers}`);
    console.log(`❌ Usuarios inactivos: ${inactiveUsers}`);

  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error.message);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  checkUsers();
}

module.exports = checkUsers;