// utils/testRegister.js
// Script para probar el registro de un usuario

const axios = require('axios');

const testUserRegistration = async () => {
  try {
    const userData = {
      username: "testuser123",
      email: "test@example.com",
      password: "Test123456",
      firstName: "Usuario",
      lastName: "Prueba"
    };

    console.log('🚀 Probando registro de usuario...');
    console.log('👤 Username:', userData.username);
    console.log('📧 Email:', userData.email);
    console.log('👤 Nombre:', userData.firstName, userData.lastName);

    const response = await axios.post('http://localhost:5000/api/users/register', userData);
    
    console.log('✅ Usuario registrado exitosamente!');
    console.log('📄 Respuesta:', response.data);

  } catch (error) {
    if (error.response) {
      console.error('❌ Error del servidor:', error.response.data);
      console.error('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('❌ No se pudo conectar al servidor. ¿Está corriendo el backend?');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
};

testUserRegistration();