const mongoose = require('mongoose');
const Book = require('./models/Book');

console.log('Verificando campo isActive...');

async function checkIsActive() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rutas-auth', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado a MongoDB');
    
    // Contar libros activos
    const activeBooks = await Book.countDocuments({ isActive: true });
    console.log(`Libros con isActive: true: ${activeBooks}`);
    
    // Contar libros sin el campo isActive
    const booksWithoutIsActive = await Book.countDocuments({ isActive: { $exists: false } });
    console.log(`Libros sin campo isActive: ${booksWithoutIsActive}`);
    
    // Mostrar algunos libros con sus campos
    const sampleBooks = await Book.find().limit(3);
    console.log('Muestra de libros:');
    sampleBooks.forEach(book => {
      console.log(`- ${book.title} (isActive: ${book.isActive})`);
    });
    
    // Intentar actualizar libros sin isActive
    const updateResult = await Book.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    console.log(`Libros actualizados con isActive: ${updateResult.modifiedCount}`);
    
    // Verificar después de la actualización
    const activeAfterUpdate = await Book.countDocuments({ isActive: true });
    console.log(`Libros activos después de actualización: ${activeAfterUpdate}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado');
  }
}

checkIsActive();