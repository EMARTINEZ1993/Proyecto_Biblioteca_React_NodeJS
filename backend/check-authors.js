// Script para verificar autores en la base de datos
import mongoose from 'mongoose';
import Author from './models/Author.js';

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/rutas-auth');
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Verificar autores
const verificarAutores = async () => {
  try {
    const autores = await Author.find({});
    console.log(`Total de autores encontrados: ${autores.length}`);
    
    autores.forEach(autor => {
      console.log(`- ${autor.name} ${autor.lastName} (${autor.nationality}) - Activo: ${autor.isActive}`);
    });

    // Verificar autores activos
    const autoresActivos = await Author.find({ isActive: true });
    console.log(`\nAutores activos: ${autoresActivos.length}`);

  } catch (error) {
    console.error('Error verificando autores:', error);
  }
};

// Ejecutar el script
const main = async () => {
  await connectDB();
  await verificarAutores();
  await mongoose.connection.close();
  console.log('Conexión cerrada');
};

main();