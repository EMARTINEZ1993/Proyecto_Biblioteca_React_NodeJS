const axios = require('axios');

async function testPaginationAndSearch() {
  console.log('🔍 PRUEBAS DE PAGINACIÓN Y BÚSQUEDA DE AUTORES\n');

  try {
    // 1. Prueba de paginación básica
    console.log('1️⃣ Prueba de paginación básica:');
    const page1Response = await axios.get('http://localhost:5001/api/authors?page=1&limit=3');
    console.log(`✅ Página 1 - Total de autores: ${page1Response.data.pagination.totalItems}`);
    console.log(`📄 Páginas totales: ${page1Response.data.pagination.totalPages}`);
    console.log(`📋 Autores en página 1: ${page1Response.data.data.length}`);
    page1Response.data.data.forEach((author, index) => {
      console.log(`   ${index + 1}. ${author.fullName}`);
    });

    // 2. Prueba de segunda página
    console.log('\n2️⃣ Prueba de segunda página:');
    const page2Response = await axios.get('http://localhost:5001/api/authors?page=2&limit=3');
    console.log(`📋 Autores en página 2: ${page2Response.data.data.length}`);
    page2Response.data.data.forEach((author, index) => {
      console.log(`   ${index + 1}. ${author.fullName}`);
    });

    // 3. Prueba de búsqueda por nombre
    console.log('\n3️⃣ Prueba de búsqueda por nombre (buscar "Isabel"):');
    const searchResponse = await axios.get('http://localhost:5001/api/authors?search=Isabel');
    console.log(`🔍 Resultados encontrados: ${searchResponse.data.data.length}`);
    searchResponse.data.data.forEach((author, index) => {
      console.log(`   ${index + 1}. ${author.fullName} - ${author.nationality}`);
    });

    // 4. Prueba de filtro por nacionalidad
    console.log('\n4️⃣ Prueba de filtro por nacionalidad (Mexicana):');
    const nationalityResponse = await axios.get('http://localhost:5001/api/authors?nationality=Mexicana');
    console.log(`🌎 Autores mexicanos encontrados: ${nationalityResponse.data.data.length}`);
    nationalityResponse.data.data.forEach((author, index) => {
      console.log(`   ${index + 1}. ${author.fullName}`);
    });

    // 5. Prueba de filtro por género
    console.log('\n5️⃣ Prueba de filtro por género (ficcion):');
    const genreResponse = await axios.get('http://localhost:5001/api/authors?genre=ficcion');
    console.log(`📚 Autores de ficción encontrados: ${genreResponse.data.data.length}`);
    genreResponse.data.data.forEach((author, index) => {
      console.log(`   ${index + 1}. ${author.fullName} - Géneros: ${author.genres.join(', ')}`);
    });

    // 6. Prueba de filtro por idioma
    console.log('\n6️⃣ Prueba de filtro por idioma (español):');
    const languageResponse = await axios.get('http://localhost:5001/api/authors?language=es');
    console.log(`🗣️ Autores en español encontrados: ${languageResponse.data.data.length}`);
    languageResponse.data.data.forEach((author, index) => {
      console.log(`   ${index + 1}. ${author.fullName}`);
    });

    // 7. Prueba de búsqueda combinada
    console.log('\n7️⃣ Prueba de búsqueda combinada (búsqueda + paginación):');
    const combinedResponse = await axios.get('http://localhost:5001/api/authors?search=a&page=1&limit=2');
    console.log(`🔍 Búsqueda "a" con límite de 2: ${combinedResponse.data.data.length} resultados`);
    console.log(`📄 Página actual: ${combinedResponse.data.pagination.currentPage}`);
    console.log(`📊 Total de resultados: ${combinedResponse.data.pagination.totalItems}`);
    combinedResponse.data.data.forEach((author, index) => {
      console.log(`   ${index + 1}. ${author.fullName}`);
    });

    // 8. Prueba de autores inactivos
    console.log('\n8️⃣ Prueba de autores inactivos (eliminados):');
    const inactiveResponse = await axios.get('http://localhost:5001/api/authors?isActive=false');
    console.log(`🗑️ Autores inactivos encontrados: ${inactiveResponse.data.data.length}`);
    inactiveResponse.data.data.forEach((author, index) => {
      console.log(`   ${index + 1}. ${author.fullName} (eliminado)`);
    });

    console.log('\n✅ TODAS LAS PRUEBAS DE PAGINACIÓN Y BÚSQUEDA COMPLETADAS EXITOSAMENTE');

  } catch (error) {
    console.log('❌ Error en las pruebas:');
    console.log('Status:', error.response?.status);
    console.log('Error:', JSON.stringify(error.response?.data, null, 2));
  }
}

testPaginationAndSearch();