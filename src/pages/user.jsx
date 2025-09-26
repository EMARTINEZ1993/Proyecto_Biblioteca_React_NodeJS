import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import './user.css';

const User = () => {
  const [formData, setFormData] = useState({
    id_type: '',
    id: '',
    name: '',
    lastname: '',
    phone: '',
    address: '',
    email: '',
    birthDate: '',
    gender: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // estado para controlar los Tabs
  const [activeTab, setActiveTab] = useState("registrar");

  /* ---------------- LISTADO QUEMADO ---------------- */
  const initialUsuarios = [
    { id_type: 'CC', id: '1039095719', name: 'Luz Eliana', lastname: 'Martínez', phone: '3165550123', address: 'Calle 1 #10-20', email: 'luz@example.com' },
    { id_type: 'CC', id: '1002003004', name: 'Carlos', lastname: 'Gómez', phone: '3124449988', address: 'Carrera 5 #8-30', email: 'carlos@example.com' },
    { id_type: 'TI', id: '12345678', name: 'María', lastname: 'Pérez', phone: '3107771234', address: 'Av. Siempre Viva 123', email: 'maria@example.com' },
    { id_type: 'CE', id: 'A9876543', name: 'John', lastname: 'Doe', phone: '3001112222', address: '123 Main St', email: 'john@example.com' },
  ];

  const [usuarios, setUsuarios] = useState(initialUsuarios);
  const [usuariosMongoDB, setUsuariosMongoDB] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);

  /* ---------------- DATOS QUEMADOS DE HISTORIAL DE PRÉSTAMOS ---------------- */
  const historialPrestamos = [
    {
      userId: '1039095719',
      userName: 'Luz Eliana Martínez',
      prestamos: [
        { id: 'P001', libro: 'Cien años de soledad', fechaPrestamo: '2024-01-15', fechaDevolucion: '2024-01-29', estado: 'Devuelto', diasRetraso: 0 },
        { id: 'P002', libro: 'El amor en los tiempos del cólera', fechaPrestamo: '2024-02-10', fechaDevolucion: null, estado: 'Activo', diasRetraso: 5 },
        { id: 'P003', libro: 'La casa de los espíritus', fechaPrestamo: '2024-03-01', fechaDevolucion: '2024-03-18', estado: 'Devuelto', diasRetraso: 3 }
      ]
    },
    {
      userId: '1002003004',
      userName: 'Carlos Gómez',
      prestamos: [
        { id: 'P004', libro: 'Don Quijote de la Mancha', fechaPrestamo: '2024-01-20', fechaDevolucion: '2024-02-05', estado: 'Devuelto', diasRetraso: 1 },
        { id: 'P005', libro: 'Rayuela', fechaPrestamo: '2024-02-25', fechaDevolucion: null, estado: 'Activo', diasRetraso: 0 }
      ]
    },
    {
      userId: '12345678',
      userName: 'María Pérez',
      prestamos: [
        { id: 'P006', libro: 'Ficciones', fechaPrestamo: '2024-01-10', fechaDevolucion: '2024-01-25', estado: 'Devuelto', diasRetraso: 0 },
        { id: 'P007', libro: 'El Aleph', fechaPrestamo: '2024-02-15', fechaDevolucion: '2024-03-05', estado: 'Devuelto', diasRetraso: 4 },
        { id: 'P008', libro: 'Laberinto de la soledad', fechaPrestamo: '2024-03-10', fechaDevolucion: null, estado: 'Activo', diasRetraso: 2 },
        { id: 'P009', libro: 'Pedro Páramo', fechaPrestamo: '2024-03-20', fechaDevolucion: null, estado: 'Activo', diasRetraso: 0 }
      ]
    },
    {
      userId: 'A9876543',
      userName: 'John Doe',
      prestamos: [
        { id: 'P010', libro: 'One Hundred Years of Solitude', fechaPrestamo: '2024-02-01', fechaDevolucion: '2024-02-20', estado: 'Devuelto', diasRetraso: 5 }
      ]
    }
  ];

  // Estado para filtros del reporte
  const [filtroReporte, setFiltroReporte] = useState('todos'); // 'todos', 'activos', 'morosos'
  const [busquedaReporte, setBusquedaReporte] = useState('');

  // Función para obtener usuarios desde MongoDB
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/usuarios');
      if (response.ok) {
        const responseData = await response.json();
        
        // La API devuelve un objeto con estructura: { success: true, data: [...], pagination: {...} }
        if (responseData.success && Array.isArray(responseData.data)) {
          setUsuariosMongoDB(responseData.data);
        } else {
          console.error('La respuesta no tiene la estructura esperada:', responseData);
          setUsuariosMongoDB([]);
        }
      } else {
        console.error('Error al obtener usuarios');
        setUsuariosMongoDB([]);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setUsuariosMongoDB([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  /* ---------------- GRAFICOS ---------------- */
  // Conteo por tipo (asegura que existan todas las categorías)
  const conteoTipo = [
    { tipo: 'CC', cantidad: usuarios.filter(u => u.id_type === 'CC').length },
    { tipo: 'TI', cantidad: usuarios.filter(u => u.id_type === 'TI').length },
    { tipo: 'CE', cantidad: usuarios.filter(u => u.id_type === 'CE').length },
    { tipo: 'NIT', cantidad: usuarios.filter(u => u.id_type === 'NIT').length },
  ];

  // Conteo por apellido (agrupar)
  const apellidoCounts = usuarios.reduce((acc, u) => {
    acc[u.lastname] = (acc[u.lastname] || 0) + 1;
    return acc;
  }, {});
  const conteoApellido = Object.keys(apellidoCounts).map(a => ({ apellido: a, cantidad: apellidoCounts[a] }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50'];

  // filtrar lista por búsqueda (usando datos de MongoDB)
  const usuariosFiltrados = Array.isArray(usuariosMongoDB) ? usuariosMongoDB.filter(u => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name?.toLowerCase().includes(q) ||
      u.lastname?.toLowerCase().includes(q) ||
      u.id?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)
    );
  }) : [];

  // función para editar usuario
  const handleEdit = (usuario) => {
    setFormData({
      id_type: usuario.id_type || '',
      id: usuario.id || '',
      name: usuario.name || '',
      lastname: usuario.lastname || '',
      phone: usuario.phone || '',
      address: usuario.address || '',
      email: usuario.email || '',
      birthDate: usuario.birthDate ? usuario.birthDate.split('T')[0] : '',
      gender: usuario.gender || ''
    });
    setEditingUser(usuario);
    setActiveTab('registrar');
    setErrors({});
  };

  // función para limpiar el formulario
  const clearForm = () => {
    setFormData({
      id_type: '',
      id: '',
      name: '',
      lastname: '',
      phone: '',
      address: '',
      email: '',
      birthDate: '',
      gender: ''
    });
    setEditingUser(null);
    setErrors({});
  };



  // abrir modal de confirmación de eliminación
  const eliminarUsuario = (id) => {
    const usuario = usuariosMongoDB.find(u => u._id === id);
    setUsuarioToDelete(usuario);
    setDeleteModalOpen(true);
  };

  // confirmar eliminación del usuario
  const confirmarEliminacion = async () => {
    if (!usuarioToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/usuarios/${usuarioToDelete._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const responseData = await response.json();
        // Actualizar la lista después de eliminar
        fetchUsuarios();
        alert(`Usuario ${usuarioToDelete.name} ${usuarioToDelete.lastname} eliminado exitosamente`);
        
        // Cerrar modal y limpiar estado
        setDeleteModalOpen(false);
        setUsuarioToDelete(null);
      } else {
        const errorData = await response.json();
        alert('Error al eliminar usuario: ' + (errorData.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión con el servidor');
    }
  };

  // exportar CSV
  const exportCSV = () => {
    const headers = ['Tipo Identificacion','Identificacion','Nombre','Apellido','Telefono','Direccion','Email','Fecha Nacimiento','Genero'];
    const rows = Array.isArray(usuariosMongoDB) ? usuariosMongoDB.map(u => [
      u.id_type, u.id, u.name, u.lastname, u.phone, u.address, u.email,
      u.birthDate ? new Date(u.birthDate).toLocaleDateString() : '',
      u.gender || ''
    ]) : [];
    const csvContent = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = 'usuarios_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // exportar PDF (print)
  const exportPDF = () => {
    const popup = window.open('', '_blank', 'width=900,height=700');
    const html = `
      <html>
        <head>
          <title>Reporte Usuarios</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; padding:20px; }
            table { width:100%; border-collapse:collapse; }
            th, td { padding:8px; border:1px solid #ddd; text-align:left; font-size:12px; }
            th { background:#6a5acd; color:#fff; }
          </style>
        </head>
        <body class="table-container ">
          <h2>Reporte de Usuarios</h2>
          <table>
            <thead>
              <tr>
                <th>Tipo</th><th>ID</th><th>Nombre</th><th>Apellido</th><th>Teléfono</th><th>Dirección</th><th>Email</th><th>Fecha Nac.</th><th>Género</th>
              </tr>
            </thead>
            <tbody>
              ${Array.isArray(usuariosMongoDB) ? usuariosMongoDB.map(u => `
                <tr>
                  <td>${u.id_type}</td>
                  <td>${u.id}</td>
                  <td>${u.name}</td>
                  <td>${u.lastname}</td>
                  <td>${u.phone}</td>
                  <td>${u.address}</td>
                  <td>${u.email}</td>
                  <td>${u.birthDate ? new Date(u.birthDate).toLocaleDateString() : ''}</td>
                  <td>${u.gender || ''}</td>
                </tr>
              `).join('') : ''}
            </tbody>
          </table>
          <script>
            setTimeout(() => { window.print(); }, 300);
          </script>
        </body>
      </html>
    `;
    popup.document.write(html);
    popup.document.close();
  };

  /* ---------------- VALIDACIÓN FORMULARIO ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{7,15}$/;
    const idRegex = /^[0-9A-Za-z]{6,12}$/;

    if (!formData.id_type) newErrors.id_type = 'El tipo de identificación es obligatorio';
    if (!formData.id.trim()) {
      newErrors.id = 'La identificación es obligatoria';
    } else if (!idRegex.test(formData.id)) {
      newErrors.id = 'La identificación debe contener entre 6 y 12 caracteres';
    }
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.lastname.trim()) newErrors.lastname = 'El apellido es obligatorio';
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'El teléfono debe contener entre 7 y 15 dígitos';
    }
    if (!formData.address.trim()) newErrors.address = 'La dirección es obligatoria';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }
    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es obligatoria';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 0 || age > 120) {
        newErrors.birthDate = 'La fecha de nacimiento no es válida';
      }
    }
    if (!formData.gender) newErrors.gender = 'El género es obligatorio';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const isEditing = editingUser !== null;
        const url = isEditing 
          ? `http://localhost:5001/api/usuarios/${editingUser._id}`
          : 'http://localhost:5001/api/usuarios';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`Usuario ${isEditing ? 'actualizado' : 'creado'} exitosamente:`, result);
          setSubmitted(true);

          // Actualizar la lista de usuarios
          fetchUsuarios();

          setTimeout(() => {
            clearForm();
            setSubmitted(false);
            if (isEditing) {
              setActiveTab('lista');
            }
          }, 3000);
        } else {
          const errorData = await response.json();
          console.error(`Error al ${isEditing ? 'actualizar' : 'crear'} usuario:`, errorData);
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const errorMessages = errorData.errors.map(err => err.msg).join('\n');
            alert(`Errores de validación:\n${errorMessages}`);
          } else {
            alert(`Error al ${isEditing ? 'actualizar' : 'crear'} usuario: ` + (errorData.message || 'Error desconocido'));
          }
        }
      } catch (error) {
        console.error('Error de conexión:', error);
        alert('Error de conexión con el servidor');
      }
    }
  };

  return (
    <div className="user-root">
      {/* Header con el mismo diseño que autores */}
      <div className="users-header">
        <h1>Gestión de Usuarios</h1>
        <div className="tab-buttons">
          <button 
            className={activeTab === 'registrar' ? 'active' : ''}
            onClick={() => setActiveTab('registrar')}
          >
            Nuevo Usuario
          </button>
          <button 
            className={activeTab === 'listado' ? 'active' : ''}
            onClick={() => setActiveTab('listado')}
          >
            Lista de Usuarios
          </button>
          <button 
            className={activeTab === 'cantidad' ? 'active' : ''}
            onClick={() => setActiveTab('cantidad')}
          >
            Reportes de Usuarios
          </button>
        </div>
      </div>
      <div className="content-divider"></div>
      {/* Contenido dinámico por Tab */}
      <div className="tabContent user-container">

        {/* ========== LISTADO ========== */}
        {activeTab === "listado" && (
          <div className="listadoUsuarios">
            <div className="listHeader">
              <div>
                <h2>Listado de Usuarios</h2>
                <p className="muted">Usuarios registrados desde MongoDB {loading && '(Cargando...)'}</p>
              </div>

              <div className="actionsRow">
                <input
                  type="search"
                  placeholder="Buscar..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="searchInput"
                />

                <button className="btn" onClick={exportCSV}> <img src="https://cdn-icons-png.flaticon.com/512/8242/8242984.png" alt="CSV" width={18} height={18}/> CSV</button>
                <button className="btn" onClick={exportPDF}> <img src="https://img.freepik.com/vector-premium/diseno-plano-moderno-icono-archivo-pdf-web_599062-7115.jpg" alt="PDF" width={18} height={18}/> PDF</button>
              </div>
            </div>

            <div className="tableWrap">
              <table className="userTable">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Fecha Nac.</th>
                    <th>Género</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.length === 0 ? (
                    <tr><td colSpan="9" style={{textAlign:'center', padding:'20px'}}>
                      {loading ? 'Cargando usuarios...' : 'No se encontraron usuarios'}
                    </td></tr>
                  ) : usuariosFiltrados.map(u => (
                    <tr key={u._id}>
                      <td>{u.id_type}</td>
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.lastname}</td>
                      <td>{u.phone}</td>
                      <td>{u.email}</td>
                      <td>{u.birthDate ? new Date(u.birthDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{u.gender || 'N/A'}</td>
                      <td className="actionsCell">
                        <button className="iconBtn" onClick={() => handleEdit(u)}>Editar</button>
                        <button className="iconBtn danger" onClick={() => eliminarUsuario(u._id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


          </div>
        )}

        {/* ========== REGISTRAR ========== */}
        {activeTab === "registrar" && (
          <>
            {submitted ? (
              <div className="successMessage">
                <h2>¡Usuario registrado con éxito!</h2>
                <p>Los datos han sido guardados correctamente.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="formCard">
                <h1 className="title">{editingUser ? 'Editar Usuario' : 'Registro de Usuarios'}</h1>

                <div className="formRow">
                  <div className="formGroup">
                    <label htmlFor="id_type">Tipo de identificación *</label>
                    <select
                      id="id_type"
                      name="id_type"
                      value={formData.id_type}
                      onChange={handleChange}
                      className={errors.id_type ? 'error' : ''}
                    >
                      <option value="">Seleccione un tipo</option>
                      <option value="CC">Cédula de Ciudadanía (CC)</option>
                      <option value="TI">Tarjeta de Identidad (TI)</option>
                      <option value="CE">Cédula de Extranjería (CE)</option>
                      <option value="NIT">Número de Identificación Tributaria (NIT)</option>
                    </select>
                    {errors.id_type && <span className="errorText">{errors.id_type}</span>}
                  </div>

                  <div className="formGroup">
                    <label htmlFor="id">Identificación *</label>
                    <input
                      type="text"
                      id="id"
                      name="id"
                      value={formData.id}
                      onChange={handleChange}
                      placeholder="Número de identificación"
                      className={errors.id ? 'error' : ''}
                    />
                    {errors.id && <span className="errorText">{errors.id}</span>}
                  </div>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label htmlFor="name">Nombre *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nombres completos"
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="errorText">{errors.name}</span>}
                  </div>

                  <div className="formGroup">
                    <label htmlFor="lastname">Apellido *</label>
                    <input
                      type="text"
                      id="lastname"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      placeholder="Apellidos completos"
                      className={errors.lastname ? 'error' : ''}
                    />
                    {errors.lastname && <span className="errorText">{errors.lastname}</span>}
                  </div>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label htmlFor="phone">Teléfono *</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Número de teléfono"
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="errorText">{errors.phone}</span>}
                  </div>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label htmlFor="address">Dirección *</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Dirección completa"
                      className={errors.address ? 'error' : ''}
                    />
                    {errors.address && <span className="errorText">{errors.address}</span>}
                  </div>

                  <div className="formGroup">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="errorText">{errors.email}</span>}
                  </div>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label htmlFor="birthDate">Fecha de Nacimiento *</label>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className={errors.birthDate ? 'error' : ''}
                    />
                    {errors.birthDate && <span className="errorText">{errors.birthDate}</span>}
                  </div>

                  <div className="formGroup">
                    <label htmlFor="gender">Género *</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={errors.gender ? 'error' : ''}
                    >
                      <option value="">Seleccione un género</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                    {errors.gender && <span className="errorText">{errors.gender}</span>}
                  </div>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="submitBtn">
                    {editingUser ? 'Actualizar Usuario' : 'Registrar Usuario'}
                  </button>
                  {editingUser && (
                    <button 
                      type="button" 
                      className="cancelBtn" 
                      onClick={() => {
                        clearForm();
                        setActiveTab('lista');
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            )}
          </>
        )}

        {/* ========== REPORTES DE HISTORIAL DE PRÉSTAMOS ========== */}
        {activeTab === "cantidad" && (
          <div style={{ width: "100%", padding: "20px" }}>
            <h2>📊 Reporte de Usuarios con Historial de Préstamos</h2>
            <p className="muted">Información detallada sobre préstamos de libros por usuario (datos simulados).</p>

            {/* Estadísticas Generales */}
            <div className="stats-container">
              <div className="stat-card">
                <h3>👥 Total Usuarios</h3>
                <span className="stat-number">{historialPrestamos.length}</span>
              </div>
              <div className="stat-card">
                <h3>📚 Préstamos Totales</h3>
                <span className="stat-number">{historialPrestamos.reduce((total, user) => total + user.prestamos.length, 0)}</span>
              </div>
              <div className="stat-card">
                <h3>🔄 Préstamos Activos</h3>
                <span className="stat-number">{historialPrestamos.reduce((total, user) => total + user.prestamos.filter(p => p.estado === 'Activo').length, 0)}</span>
              </div>
              <div className="stat-card">
                <h3>⚠️ Usuarios Morosos</h3>
                <span className="stat-number">{historialPrestamos.filter(user => user.prestamos.some(p => p.estado === 'Activo' && p.diasRetraso > 0)).length}</span>
              </div>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="filters-container">
              <div className="filter-group">
                <label>🔍 Buscar Usuario:</label>
                <input
                  type="text"
                  placeholder="Nombre o ID del usuario..."
                  value={busquedaReporte}
                  onChange={(e) => setBusquedaReporte(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="filter-group">
                <label>📋 Filtrar por Estado:</label>
                <select
                  value={filtroReporte}
                  onChange={(e) => setFiltroReporte(e.target.value)}
                  className="filter-select"
                >
                  <option value="todos">Todos los usuarios</option>
                  <option value="activos">Con préstamos activos</option>
                  <option value="morosos">Usuarios morosos</option>
                </select>
              </div>
            </div>

            {/* Tabla de Usuarios con Historial */}
            <div className="report-table-container">
              {historialPrestamos
                .filter(user => {
                  // Filtro por búsqueda
                  const matchesSearch = busquedaReporte === '' || 
                    user.userName.toLowerCase().includes(busquedaReporte.toLowerCase()) ||
                    user.userId.toLowerCase().includes(busquedaReporte.toLowerCase());
                  
                  // Filtro por estado
                  let matchesFilter = true;
                  if (filtroReporte === 'activos') {
                    matchesFilter = user.prestamos.some(p => p.estado === 'Activo');
                  } else if (filtroReporte === 'morosos') {
                    matchesFilter = user.prestamos.some(p => p.estado === 'Activo' && p.diasRetraso > 0);
                  }
                  
                  return matchesSearch && matchesFilter;
                })
                .map(user => (
                  <div key={user.userId} className="user-report-card">
                    <div className="user-header">
                      <div className="user-info">
                        <h3>👤 {user.userName}</h3>
                        <span className="user-id">ID: {user.userId}</span>
                      </div>
                      <div className="user-stats">
                        <span className="badge">📚 {user.prestamos.length} préstamos</span>
                        <span className={`badge ${user.prestamos.some(p => p.estado === 'Activo' && p.diasRetraso > 0) ? 'badge-warning' : 'badge-success'}`}>
                          {user.prestamos.some(p => p.estado === 'Activo' && p.diasRetraso > 0) ? '⚠️ Moroso' : '✅ Al día'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="prestamos-list">
                      <h4>📖 Historial de Préstamos:</h4>
                      <div className="prestamos-grid">
                        {user.prestamos.map(prestamo => (
                          <div key={prestamo.id} className={`prestamo-item ${prestamo.estado.toLowerCase()}`}>
                            <div className="prestamo-header">
                              <strong>{prestamo.libro}</strong>
                              <span className={`status ${prestamo.estado.toLowerCase()}`}>
                                {prestamo.estado === 'Activo' ? '🔄' : '✅'} {prestamo.estado}
                              </span>
                            </div>
                            <div className="prestamo-details">
                              <p><strong>Préstamo:</strong> {prestamo.fechaPrestamo}</p>
                              {prestamo.fechaDevolucion && (
                                <p><strong>Devolución:</strong> {prestamo.fechaDevolucion}</p>
                              )}
                              {prestamo.diasRetraso > 0 && (
                                <p className="retraso"><strong>⚠️ Días de retraso:</strong> {prestamo.diasRetraso}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Gráficos de Estadísticas */}
            <div className="charts-section">
              <h3>📈 Estadísticas Visuales</h3>
              <div className="chartWrap">
                {/* Gráfico de Estados de Préstamos */}
                <div className="chartBox">
                  <h4>Estados de Préstamos</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { 
                            name: 'Activos', 
                            value: historialPrestamos.reduce((total, user) => total + user.prestamos.filter(p => p.estado === 'Activo').length, 0) 
                          },
                          { 
                            name: 'Devueltos', 
                            value: historialPrestamos.reduce((total, user) => total + user.prestamos.filter(p => p.estado === 'Devuelto').length, 0) 
                          }
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                      >
                        <Cell fill="#ff7f50" />
                        <Cell fill="#82ca9d" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de Préstamos por Usuario */}
                <div className="chartBox">
                  <h4>Préstamos por Usuario</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historialPrestamos.map(user => ({
                      usuario: user.userName.split(' ')[0],
                      prestamos: user.prestamos.length,
                      activos: user.prestamos.filter(p => p.estado === 'Activo').length
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="usuario" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="prestamos" fill="#8884d8" name="Total Préstamos" />
                      <Bar dataKey="activos" fill="#ff7f50" name="Préstamos Activos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteModalOpen && (
        <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar Eliminación</h3>
            <p>¿Está seguro de que desea eliminar al usuario "{usuarioToDelete?.name} {usuarioToDelete?.lastname}"?</p>
            <div className="modal-buttons">
              <button onClick={() => confirmarEliminacion()} className="btn-danger">
                Eliminar
              </button>
              <button onClick={() => setDeleteModalOpen(false)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;
