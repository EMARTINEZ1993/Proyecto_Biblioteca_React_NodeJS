const mongoose = require('mongoose');
const Book = require('./models/Book');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/rutas-auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkBooks() {
  try {
    console.log('Conectando a MongoDB...');
    
    // Esperar a que la conexión esté lista
    await mongoose.connection.asPromise();
    console.log('✅ Conexión a MongoDB establecida');
    
    // Contar libros
    const count = await Book.countDocuments();
    console.log(`Total de libros en la base de datos: ${count}`);
    
    // Mostrar algunos libros
    const books = await Book.find().limit(5);
    console.log('Primeros 5 libros:');
    books.forEach(book => {
      console.log(`- ${book.title} por ${book.author}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

checkBooks();