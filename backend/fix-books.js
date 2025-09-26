const mongoose = require('mongoose');
const Book = require('./models/Book');

console.log('Iniciando actualización de libros...');

async function fixBooks() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/rutas-auth', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado a MongoDB');
    
    // Actualizar todos los libros que no tienen el campo isDeleted
    const result = await Book.updateMany(
      { isDeleted: { $exists: false } },
      { $set: { isDeleted: false } }
    );
    
    console.log(`Libros actualizados: ${result.modifiedCount}`);
    
    // Verificar el resultado
    const activeBooks = await Book.countDocuments({ isDeleted: false });
    console.log(`Libros activos ahora: ${activeBooks}`);
    
    console.log('✅ Actualización completada');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado');
  }
}

fixBooks();