// Script para insertar autores de prueba en la base de datos
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

// Autores de prueba
const autoresPrueba = [
  {
    name: 'Gabriel',
    lastName: 'García Márquez',
    nationality: 'colombiana',
    genres: ['realismo-magico', 'ficcion'],
    biography: 'Escritor colombiano, premio Nobel de Literatura en 1982. Conocido por obras como "Cien años de soledad" y "El amor en los tiempos del cólera". Su obra se caracteriza por el realismo mágico y la exploración de la soledad humana.',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Gabriel_Garcia_Marquez.jpg',
    works: 'Cien años de soledad, El amor en los tiempos del cólera, Crónica de una muerte anunciada',
    awards: 'Premio Nobel de Literatura (1982), Premio Cervantes (1982)',
    language: 'es',
    socialLinks: 'https://www.gabrielgarciamarquez.com',
    birthDate: new Date('1927-03-06'),
    deathDate: new Date('2014-04-17'),
    isActive: true
  },
  {
    name: 'Isabel',
    lastName: 'Allende',
    nationality: 'chilena',
    genres: ['realismo-magico', 'ficcion', 'biografia'],
    biography: 'Escritora chilena-estadounidense, una de las novelistas de lengua española más leídas del mundo. Su obra combina elementos del realismo mágico con temas feministas y sociales.',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Isabel_Allende_-_001.jpg',
    works: 'La casa de los espíritus, De amor y de sombra, Eva Luna',
    awards: 'Premio Nacional de Literatura de Chile (2010), Medalla Presidencial de la Libertad (2014)',
    language: 'es',
    socialLinks: 'https://www.isabelallende.com',
    birthDate: new Date('1942-08-02'),
    isActive: true
  },
  {
    name: 'Mario',
    lastName: 'Vargas Llosa',
    nationality: 'peruana',
    genres: ['ficcion', 'ensayo', 'drama'],
    biography: 'Escritor peruano, premio Nobel de Literatura en 2010. Uno de los exponentes del boom latinoamericano. Su obra abarca novelas, ensayos y obras teatrales con un estilo narrativo complejo.',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Mario_Vargas_Llosa_2011.jpg',
    works: 'La ciudad y los perros, Conversación en La Catedral, La fiesta del chivo',
    awards: 'Premio Nobel de Literatura (2010), Premio Cervantes (1994)',
    language: 'es',
    socialLinks: 'https://mvargasllosa.com',
    birthDate: new Date('1936-03-28'),
    isActive: true
  },
  {
    name: 'Octavio',
    lastName: 'Paz',
    nationality: 'mexicana',
    genres: ['poesia', 'ensayo'],
    biography: 'Poeta y ensayista mexicano, premio Nobel de Literatura en 1990. Su obra poética se caracteriza por la exploración de la identidad mexicana y la condición humana universal.',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Octavio_Paz_1988.jpg',
    works: 'El laberinto de la soledad, Piedra de sol, Libertad bajo palabra',
    awards: 'Premio Nobel de Literatura (1990), Premio Cervantes (1981)',
    language: 'es',
    socialLinks: 'https://www.octaviopaz.mx',
    birthDate: new Date('1914-03-31'),
    deathDate: new Date('1998-04-19'),
    isActive: true
  },
  {
    name: 'Jorge Luis',
    lastName: 'Borges',
    nationality: 'argentina',
    genres: ['ficcion', 'poesia', 'ensayo'],
    biography: 'Escritor argentino, uno de los autores más destacados de la literatura del siglo XX. Sus cuentos y ensayos exploran temas como el infinito, los laberintos y la naturaleza de la realidad.',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Jorge_Luis_Borges_1951.jpg',
    works: 'Ficciones, El Aleph, Laberintos',
    awards: 'Premio Cervantes (1979), Premio Internacional de Literatura',
    language: 'es',
    socialLinks: 'https://www.borges.pitt.edu',
    birthDate: new Date('1899-08-24'),
    deathDate: new Date('1986-06-14'),
    isActive: true
  }
];

// Función para insertar autores
const insertarAutores = async () => {
  try {
    // Limpiar la colección primero
    await Author.deleteMany({});
    console.log('Colección de autores limpiada');

    // Insertar autores de prueba
    const autoresInsertados = await Author.insertMany(autoresPrueba);
    console.log(`${autoresInsertados.length} autores insertados exitosamente`);

    // Mostrar los autores insertados
    autoresInsertados.forEach(autor => {
      console.log(`- ${autor.name} ${autor.lastName} (${autor.nationality})`);
    });

  } catch (error) {
    console.error('Error insertando autores:', error);
  }
};

// Ejecutar el script
const main = async () => {
  await connectDB();
  await insertarAutores();
  await mongoose.connection.close();
  console.log('Conexión cerrada');
};

main();