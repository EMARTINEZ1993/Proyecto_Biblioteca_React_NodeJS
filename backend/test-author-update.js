const axios = require('axios');

async function testUpdateAuthor() {
  try {
    // Primero obtenemos el ID del autor que acabamos de crear (Elena Poniatowska)
    const getResponse = await axios.get('http://localhost:5001/api/authors');
    const authors = getResponse.data.data;
    const elena = authors.find(author => author.name === 'Elena' && author.lastName === 'Poniatowska');
    
    if (!elena) {
      console.log('❌ No se encontró el autor Elena Poniatowska para actualizar');
      return;
    }

    console.log('📝 Actualizando autor con ID:', elena._id);

    // Datos actualizados
    const updatedData = {
      biography: 'Escritora y periodista mexicana de origen francés-polaco. Reconocida por su trabajo en periodismo narrativo y literatura testimonial. Ha dedicado gran parte de su obra a dar voz a los marginados y a documentar la historia social de México. Ganadora del Premio Cervantes en 2013.',
      works: 'La noche de Tlatelolco, Hasta no verte Jesús mío, Querido Diego te abraza Quiela, Tinísima',
      awards: 'Premio Cervantes (2013), Premio Nacional de Ciencias y Artes, Premio Alfaguara de Novela'
    };

    console.log('Enviando datos actualizados:', JSON.stringify(updatedData, null, 2));

    const response = await axios.put(`http://localhost:5001/api/authors/${elena._id}`, updatedData);

    console.log('✅ Autor actualizado exitosamente:');
    console.log('Status:', response.status);
    console.log('Respuesta:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Error al actualizar autor:');
    console.log('Status:', error.response?.status);
    console.log('Error:', JSON.stringify(error.response?.data, null, 2));
  }
}

testUpdateAuthor();