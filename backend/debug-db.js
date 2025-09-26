const mongoose = require('mongoose');
const Book = require('./models/Book');

console.log('Iniciando script de debug...');

async function debugDB() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/rutas-auth', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado a MongoDB');
    console.log('Base de datos:', mongoose.connection.name);
    
    // Contar todos los documentos
    const totalBooks = await Book.countDocuments();
    console.log(`Total de libros: ${totalBooks}`);
    
    // Contar libros no eliminados
    const activeBooks = await Book.countDocuments({ isDeleted: false });
    console.log(`Libros activos (isDeleted: false): ${activeBooks}`);
    
    // Contar libros sin el campo isDeleted
    const booksWithoutIsDeleted = await Book.countDocuments({ isDeleted: { $exists: false } });
    console.log(`Libros sin campo isDeleted: ${booksWithoutIsDeleted}`);
    
    // Mostrar algunos libros
    const sampleBooks = await Book.find().limit(3);
    console.log('Muestra de libros:');
    sampleBooks.forEach(book => {
      console.log(`- ${book.title} (isDeleted: ${book.isDeleted})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado');
  }
}

debugDB();