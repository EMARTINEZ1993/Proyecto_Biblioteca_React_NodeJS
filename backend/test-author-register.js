const axios = require('axios');

const testAuthorRegistration = async () => {
  try {
    const authorData = {
      name: 'Elena',
      lastName: 'Poniatowska',
      nationality: 'mexicana',
      genres: ['no-ficcion', 'cronica', 'biografia'],
      biography: 'Escritora y periodista mexicana de origen francés-polaco. Reconocida por su trabajo en periodismo narrativo y literatura testimonial. Ha dedicado gran parte de su obra a dar voz a los marginados y a documentar la historia social de México.',
      photo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Elena_Poniatowska.jpg',
      language: 'es',
      works: 'La noche de Tlatelolco, Hasta no verte Jesús mío, Querido Diego te abraza Quiela',
      awards: 'Premio Cervantes (2013), Premio Nacional de Ciencias y Artes',
      socialLinks: 'https://www.elenaponiatowska.com'
    };

    console.log('Enviando datos del autor:', JSON.stringify(authorData, null, 2));

    const response = await axios.post('http://localhost:5001/api/authors', authorData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Autor registrado exitosamente:');
    console.log('Status:', response.status);
    console.log('Respuesta:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error al registrar autor:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
  }
};

testAuthorRegistration();