# 📚 Sistema de Gestión de Biblioteca - React + Node.js

Un sistema completo de gestión de biblioteca desarrollado con React (Frontend) y Node.js (Backend), que incluye autenticación de usuarios, rutas privadas y gestión completa de libros, autores y préstamos.

## 🚀 Características Principales

### 🔐 Autenticación y Seguridad
- Sistema de registro e inicio de sesión
- Autenticación JWT (JSON Web Tokens)
- Rutas privadas protegidas
- Recuperación de contraseña por email
- Middleware de autenticación
- Validación de datos con express-validator
- Protección contra ataques XSS y sanitización de datos

### 📖 Gestión de Biblioteca
- **Gestión de Libros**: Crear, leer, actualizar y eliminar libros
- **Gestión de Autores**: Administrar información de autores
- **Sistema de Préstamos**: Control de préstamos y devoluciones
- **Gestión de Usuarios**: Administración de usuarios del sistema
- **Dashboard**: Panel de control con estadísticas

### 🎨 Interfaz de Usuario
- Diseño responsive y moderno
- Tema claro/oscuro
- Componentes reutilizables
- Navegación intuitiva
- Alertas y notificaciones
- Spinner de carga

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19** - Biblioteca de JavaScript para interfaces de usuario
- **Vite** - Herramienta de construcción rápida
- **React Router DOM** - Enrutamiento del lado del cliente
- **Axios** - Cliente HTTP para API calls
- **EmailJS** - Servicio de envío de emails
- **Recharts** - Gráficos y visualización de datos
- **CSS3** - Estilos personalizados

### Backend
- **Node.js** - Entorno de ejecución de JavaScript
- **Express.js** - Framework web para Node.js
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación basada en tokens
- **bcryptjs** - Encriptación de contraseñas
- **Nodemailer** - Envío de emails
- **Morgan** - Logger de HTTP requests

### Seguridad
- **Helmet** - Configuración de headers de seguridad
- **CORS** - Control de acceso entre dominios
- **Express Rate Limit** - Limitación de requests
- **Express Mongo Sanitize** - Sanitización de datos
- **XSS Clean** - Protección contra ataques XSS
- **HPP** - Protección contra HTTP Parameter Pollution

## 📁 Estructura del Proyecto

```
rutas-auth/
├── backend/                 # Servidor Node.js
│   ├── config/             # Configuración de base de datos
│   ├── controllers/        # Controladores de la API
│   ├── middleware/         # Middleware personalizado
│   ├── models/            # Modelos de MongoDB
│   ├── routes/            # Rutas de la API
│   ├── utils/             # Utilidades y helpers
│   └── server.js          # Punto de entrada del servidor
├── src/                   # Aplicación React
│   ├── components/        # Componentes reutilizables
│   ├── context/          # Context API (Auth, Theme)
│   ├── pages/            # Páginas de la aplicación
│   ├── routes/           # Configuración de rutas
│   ├── services/         # Servicios (API calls)
│   ├── styles/           # Archivos CSS
│   └── utils/            # Utilidades del frontend
├── public/               # Archivos estáticos
└── package.json         # Dependencias del frontend
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- MongoDB (local o MongoDB Atlas)
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/EMARTINEZ1993/Proyecto_Biblioteca_React_NodeJS.git
cd Proyecto_Biblioteca_React_NodeJS
```

### 2. Configurar el Backend
```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta `backend`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/biblioteca
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Configurar el Frontend
```bash
cd ..
npm install
```

Crear archivo `.env` en la raíz del proyecto:
```env
VITE_API_URL=http://localhost:5000/api
VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_TEMPLATE_ID=tu_template_id
VITE_EMAILJS_PUBLIC_KEY=tu_public_key
```

### 4. Iniciar la aplicación

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
npm run dev
```

La aplicación estará disponible en:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/forgot-password` - Recuperar contraseña
- `POST /api/auth/reset-password` - Restablecer contraseña

### Usuarios
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Libros
- `GET /api/books` - Obtener todos los libros
- `POST /api/books` - Crear nuevo libro
- `GET /api/books/:id` - Obtener libro por ID
- `PUT /api/books/:id` - Actualizar libro
- `DELETE /api/books/:id` - Eliminar libro

### Autores
- `GET /api/authors` - Obtener todos los autores
- `POST /api/authors` - Crear nuevo autor
- `GET /api/authors/:id` - Obtener autor por ID
- `PUT /api/authors/:id` - Actualizar autor
- `DELETE /api/authors/:id` - Eliminar autor

### Préstamos
- `GET /api/borrows` - Obtener todos los préstamos
- `POST /api/borrows` - Crear nuevo préstamo
- `PUT /api/borrows/:id` - Actualizar préstamo
- `DELETE /api/borrows/:id` - Eliminar préstamo

## 🔧 Scripts Disponibles

### Frontend
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

### Backend
- `npm start` - Inicia el servidor en modo producción
- `npm run dev` - Inicia el servidor en modo desarrollo
- `npm run check-users` - Verifica usuarios en la base de datos
- `npm run test-register` - Prueba el registro de usuarios
- `npm run clear-users` - Limpia usuarios de la base de datos

## 🎯 Funcionalidades Implementadas

- ✅ Sistema de autenticación completo
- ✅ Rutas privadas y protegidas
- ✅ CRUD completo para libros, autores y usuarios
- ✅ Sistema de préstamos
- ✅ Dashboard con estadísticas
- ✅ Tema claro/oscuro
- ✅ Responsive design
- ✅ Validación de formularios
- ✅ Manejo de errores
- ✅ Notificaciones de usuario
- ✅ Recuperación de contraseña por email

## 🔒 Seguridad

El proyecto implementa múltiples capas de seguridad:
- Encriptación de contraseñas con bcrypt
- Autenticación JWT
- Validación y sanitización de datos
- Protección contra ataques XSS
- Rate limiting
- Headers de seguridad con Helmet
- Configuración CORS

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**EMARTINEZ1993**
- GitHub: [@EMARTINEZ1993](https://github.com/EMARTINEZ1993)

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio de GitHub.

---

⭐ ¡No olvides dar una estrella al proyecto si te ha sido útil!
