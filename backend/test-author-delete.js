const axios = require('axios');

async function testDeleteAuthor() {
  try {
    // Primero obtenemos la lista de autores para encontrar uno para eliminar
    const getResponse = await axios.get('http://localhost:5001/api/authors');
    const authors = getResponse.data.data;
    
    console.log('📋 Autores disponibles:');
    authors.forEach((author, index) => {
      console.log(`${index + 1}. ${author.fullName} (ID: ${author._id})`);
    });

    // Vamos a eliminar el último autor de la lista (Elena Poniatowska)
    const authorToDelete = authors[authors.length - 1];
    
    if (!authorToDelete) {
      console.log('❌ No hay autores para eliminar');
      return;
    }

    console.log(`\n🗑️ Eliminando autor: ${authorToDelete.fullName} (ID: ${authorToDelete._id})`);

    const deleteResponse = await axios.delete(`http://localhost:5001/api/authors/${authorToDelete._id}`);

    console.log('✅ Autor eliminado exitosamente:');
    console.log('Status:', deleteResponse.status);
    console.log('Respuesta:', JSON.stringify(deleteResponse.data, null, 2));

    // Verificar que el autor ya no aparece en la lista activa
    console.log('\n🔍 Verificando que el autor ya no aparece en la lista activa...');
    const verifyResponse = await axios.get('http://localhost:5001/api/authors');
    const activeAuthors = verifyResponse.data.data;
    
    const deletedAuthorStillActive = activeAuthors.find(author => author._id === authorToDelete._id);
    
    if (deletedAuthorStillActive) {
      console.log('❌ ERROR: El autor eliminado aún aparece en la lista activa');
    } else {
      console.log('✅ CORRECTO: El autor eliminado ya no aparece en la lista activa');
      console.log(`📊 Autores activos restantes: ${activeAuthors.length}`);
    }

  } catch (error) {
    console.log('❌ Error al eliminar autor:');
    console.log('Status:', error.response?.status);
    console.log('Error:', JSON.stringify(error.response?.data, null, 2));
  }
}

testDeleteAuthor();