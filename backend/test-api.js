// Script para probar la API directamente
const Author = require('./models/Author');
const mongoose = require('mongoose');

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

// Simular la función del controlador
const testObtenerAutores = async () => {
  try {
    const isActive = true;
    const filtros = { isActive: isActive === true };
    
    console.log('Filtros aplicados:', filtros);
    
    // Obtener autores con los mismos filtros que el controlador
    const autores = await Author.find(filtros)
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`Autores encontrados: ${autores.length}`);
    
    if (autores.length > 0) {
      console.log('Primer autor:', {
        name: autores[0].name,
        lastName: autores[0].lastName,
        isActive: autores[0].isActive
      });
    }

    // Contar total de documentos
    const total = await Author.countDocuments(filtros);
    console.log(`Total de documentos: ${total}`);

    // Probar sin filtros
    const todosSinFiltros = await Author.find({});
    console.log(`Todos los autores sin filtros: ${todosSinFiltros.length}`);

  } catch (error) {
    console.error('Error:', error);
  }
};

// Ejecutar el test
const main = async () => {
  await connectDB();
  await testObtenerAutores();
  await mongoose.connection.close();
  console.log('Conexión cerrada');
};

main();