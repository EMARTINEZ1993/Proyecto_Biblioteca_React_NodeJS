# Backend de Autenticación - API REST

Este es el backend para el sistema de autenticación de usuarios con MongoDB.

## 🚀 Características

- ✅ Registro y login de usuarios
- ✅ Autenticación con JWT
- ✅ Validación de datos
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Middleware de seguridad
- ✅ Rate limiting
- ✅ Manejo de errores
- ✅ Conexión a MongoDB

## 📁 Estructura del Proyecto

```
backend/
├── config/
│   └── database.js          # Configuración de MongoDB
├── controllers/
│   └── userController.js    # Controladores de usuario
├── middleware/
│   ├── auth.js             # Middleware de autenticación
│   └── errorHandler.js     # Manejo de errores
├── models/
│   └── User.js             # Modelo de usuario
├── routes/
│   └── userRoutes.js       # Rutas de usuario
├── .env                    # Variables de entorno
├── package.json            # Dependencias
└── server.js              # Servidor principal
```

## 🛠️ Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Edita el archivo `.env` con tus configuraciones:
   ```env
   # Configuración del servidor
   NODE_ENV=development
   PORT=5000

   # Base de datos MongoDB
   MONGODB_URI=mongodb://localhost:27017/auth-app

   # JWT
   JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
   JWT_EXPIRE=7d

   # CORS
   FRONTEND_URL=http://localhost:3000

   # Rate Limiting
   RATE_LIMIT_WINDOW=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Iniciar el servidor:**
   ```bash
   # Desarrollo
   npm run dev

   # Producción
   npm start
   ```

## 📡 Endpoints de la API

### Rutas Públicas

#### Registro de Usuario
- **POST** `/api/users/register`
- **Body:**
  ```json
  {
    "username": "usuario123",
    "email": "usuario@email.com",
    "password": "Password123",
    "firstName": "Juan",
    "lastName": "Pérez"
  }
  ```

#### Login
- **POST** `/api/users/login`
- **Body:**
  ```json
  {
    "email": "usuario@email.com",
    "password": "Password123"
  }
  ```

### Rutas Protegidas (Requieren Token)

#### Obtener Perfil
- **GET** `/api/users/profile`
- **Headers:** `Authorization: Bearer <token>`

#### Actualizar Perfil
- **PUT** `/api/users/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "username": "nuevoUsuario",
    "email": "nuevo@email.com",
    "firstName": "Juan Carlos",
    "lastName": "Pérez García"
  }
  ```

#### Cambiar Contraseña
- **PUT** `/api/users/change-password`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "currentPassword": "Password123",
    "newPassword": "NewPassword456",
    "confirmPassword": "NewPassword456"
  }
  ```

#### Obtener Todos los Usuarios
- **GET** `/api/users`
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `?page=1&limit=10`

### Rutas de Sistema

#### Health Check
- **GET** `/api/health`

#### Información de la API
- **GET** `/`

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación. Después del login exitoso, recibirás un token que debes incluir en el header `Authorization` de las siguientes requests:

```
Authorization: Bearer <tu_token_aqui>
```

## 📝 Validaciones

### Registro:
- **Username:** 3-30 caracteres, solo letras, números y guiones bajos
- **Email:** Formato de email válido
- **Password:** Mínimo 6 caracteres, debe contener al menos una minúscula, una mayúscula y un número
- **Nombre y Apellido:** 2-50 caracteres, solo letras y espacios

### Login:
- **Email:** Formato de email válido
- **Password:** Requerido

## 🛡️ Seguridad

- Contraseñas encriptadas con bcrypt
- Rate limiting (100 requests por 15 minutos)
- Sanitización de datos (prevención de inyección NoSQL)
- Protección XSS
- Headers de seguridad con Helmet
- Validación de entrada con express-validator

## 🗄️ Base de Datos

### Modelo de Usuario:
```javascript
{
  username: String (único),
  email: String (único),
  password: String (encriptado),
  firstName: String,
  lastName: String,
  role: String (default: 'user'),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚨 Manejo de Errores

La API devuelve respuestas consistentes:

### Éxito:
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

### Error:
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [ ... ] // Solo para errores de validación
}
```

## 🔧 Scripts Disponibles

```bash
npm start          # Iniciar en producción
npm run dev        # Iniciar en desarrollo con nodemon
npm test           # Ejecutar tests (por implementar)
```

## 📋 Requisitos

- Node.js 14+
- MongoDB 4.4+
- npm o yarn

## 🤝 Integración con Frontend

Para conectar con tu frontend React:

1. Asegúrate de que `FRONTEND_URL` en `.env` apunte a tu aplicación React
2. Usa el token JWT en las requests autenticadas
3. Maneja los estados de loading y error apropiadamente

### Ejemplo de uso en React:

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  
  return data;
};

// Request autenticada
const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
};
```

## 📞 Soporte

Si tienes problemas:

1. Verifica que MongoDB esté ejecutándose
2. Revisa las variables de entorno en `.env`
3. Consulta los logs del servidor
4. Verifica que el puerto 5000 esté disponible

¡El backend está listo para usar! 🎉