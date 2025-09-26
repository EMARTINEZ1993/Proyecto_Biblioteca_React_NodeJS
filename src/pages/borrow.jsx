import { useState, useEffect } from 'react';
import '../styles/borrow.css'; // Estilos específicos para préstamos
import './books.css';

const API_URL = 'http://localhost:5001/api/borrows';
const BOOKS_API_URL = 'http://localhost:5001/api/books';
const USERS_API_URL = 'http://localhost:5001/api/users/list';

// Función para obtener headers con token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const Borrow = () => {
  const [formData, setFormData] = useState({
    user: '',
    book: '',
    borrowDate: new Date().toISOString().split('T')[0], // Fecha actual del sistema
    loanDuration: '15', // Duración por defecto: 15 días
    dueDate: '', // Se calculará automáticamente
    administrator: '', // Se obtendrá del usuario logueado
    userDocument: '', // Documento del usuario
    userPhone: '', // Teléfono del usuario
    userEmail: '', // Email del usuario
    notes: '',
    priority: 'normal' // Prioridad del préstamo
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [borrows, setBorrows] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingBorrow, setEditingBorrow] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    userId: '',
    page: 1,
    limit: 10
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({});
  
  // Estados para modales
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [modalMessage, setModalMessage] = useState('');

  // Funciones para manejar modales
  const showSuccess = (message) => {
    setModalMessage(message);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  const showConfirm = (message, action) => {
    setModalMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const showBorrowDetails = (borrow) => {
    setSelectedBorrow(borrow);
    setShowDetailModal(true);
  };

  const openEditModal = (borrow) => {
    setSelectedBorrow(borrow);
    setEditingBorrow(borrow);
    setFormData({
      user: borrow.user?._id || '',
      book: borrow.book?._id || '',
      borrowDate: borrow.borrowDate ? new Date(borrow.borrowDate).toISOString().split('T')[0] : '',
      loanDuration: '15',
      dueDate: borrow.dueDate ? new Date(borrow.dueDate).toISOString().split('T')[0] : '',
      administrator: borrow.administrator || currentAdmin,
      userDocument: borrow.user?.document || '',
      userPhone: borrow.user?.phone || '',
      userEmail: borrow.user?.email || '',
      notes: borrow.notes || '',
      priority: borrow.priority || 'normal'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validación
    const newErrors = {};
    if (!formData.dueDate) {
      newErrors.dueDate = 'La fecha de vencimiento es requerida';
    } else {
      const today = new Date();
      const dueDate = new Date(formData.dueDate);
      if (dueDate <= today) {
        newErrors.dueDate = 'La fecha de vencimiento debe ser posterior a hoy';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const updateData = {
        dueDate: formData.dueDate,
        notes: formData.notes,
        priority: formData.priority
      };

      const response = await fetch(`${API_URL}/${selectedBorrow._id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Préstamo actualizado exitosamente');
        setShowEditModal(false);
        fetchBorrows();
      } else {
        showSuccess(data.message || 'Error al actualizar el préstamo');
      }
    } catch (error) {
      console.error('Error:', error);
      showSuccess('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener libros disponibles
  const fetchBooks = async () => {
    try {
      const response = await fetch(`${BOOKS_API_URL}?limit=100`);
      const data = await response.json();
      
      if (response.ok) {
        setBooks(data.data || []);
      } else {
        console.error('Error al obtener libros:', data.message);
      }
    } catch (error) {
      console.error('Error de conexión al obtener libros:', error);
    }
  };

  // Función para obtener usuarios
  const fetchUsers = async () => {
    try {
      const response = await fetch(USERS_API_URL);
      const data = await response.json();
      
      if (response.ok) {
        // La respuesta viene en data.data.users para el endpoint /list
        const usersData = data.data?.users || data.data || [];
        setUsers(usersData);
        setFilteredUsers(usersData);
      } else {
        console.error('Error al obtener usuarios:', data.message);
      }
    } catch (error) {
      console.error('Error de conexión al obtener usuarios:', error);
    }
  };

  const getCurrentAdmin = () => {
    // Obtener información del administrador actual desde localStorage
    const adminData = localStorage.getItem('currentUser') || localStorage.getItem('user');
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        // Usar fullName primero, luego firstName + lastName, luego username, luego email
        const adminName = admin.fullName || 
                         (admin.firstName && admin.lastName ? `${admin.firstName} ${admin.lastName}` : '') ||
                         admin.username || 
                         admin.email || 
                         'Administrador';
        setCurrentAdmin(adminName);
        setFormData(prev => ({
          ...prev,
          administrator: adminName
        }));
      } catch (error) {
        console.error('Error parsing admin data:', error);
        setCurrentAdmin('Administrador del Sistema');
        setFormData(prev => ({
          ...prev,
          administrator: 'Administrador del Sistema'
        }));
      }
    } else {
      setCurrentAdmin('Administrador del Sistema');
      setFormData(prev => ({
        ...prev,
        administrator: 'Administrador del Sistema'
      }));
    }
  };

  // Función para obtener préstamos
  const fetchBorrows = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.userId) queryParams.append('userId', filters.userId);
      queryParams.append('page', currentPage);
      queryParams.append('limit', filters.limit);

      const url = `${API_URL}?${queryParams}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (response.ok) {
        setBorrows(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.error('Error al obtener préstamos:', data.message);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener estadísticas
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (response.ok) {
        setStats(data.data || {});
      }
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    }
  };

  // Función para crear préstamo
  const saveBorrow = async (borrowData) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(borrowData)
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Préstamo creado exitosamente');
        setFormData({
          userId: '',
          bookId: '',
          dueDate: '',
          notes: ''
        });
        setErrors({});
        setSubmitted(false);
        setActiveTab('list');
        fetchBorrows();
        fetchStats();
      } else {
        if (data.errors) {
          const newErrors = {};
          data.errors.forEach(error => {
            newErrors[error.path] = error.msg;
          });
          setErrors(newErrors);
        } else {
          showSuccess(data.message || 'Error al crear el préstamo');
        }
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      showSuccess('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para devolver libro
  const returnBook = (borrowId, notes = '') => {
    showConfirm(
      '¿Estás seguro de que quieres marcar este libro como devuelto?',
      async () => {
        setLoading(true);
        try {
          const response = await fetch(`${API_URL}/${borrowId}/return`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ notes })
          });

          const data = await response.json();

          if (response.ok) {
            showSuccess('Libro devuelto exitosamente');
            fetchBorrows();
            fetchStats();
          } else {
            showSuccess(data.message || 'Error al devolver el libro');
          }
        } catch (error) {
          console.error('Error de conexión:', error);
          showSuccess('Error de conexión. Intenta de nuevo.');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // Función para renovar préstamo
  const renewBorrow = (borrowId, additionalDays = 14) => {
    showConfirm(
      `¿Estás seguro de que quieres renovar este préstamo por ${additionalDays} días más?`,
      async () => {
        setLoading(true);
        try {
          const response = await fetch(`${API_URL}/${borrowId}/renew`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ additionalDays })
          });

          const data = await response.json();

          if (response.ok) {
            showSuccess('Préstamo renovado exitosamente');
            fetchBorrows();
            fetchStats();
          } else {
            showSuccess(data.message || 'Error al renovar el préstamo');
          }
        } catch (error) {
          console.error('Error de conexión:', error);
          showSuccess('Error de conexión. Intenta de nuevo.');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // Función para marcar como perdido
  const markAsLost = (borrowId, notes = '') => {
    showConfirm(
      '¿Estás seguro de que quieres marcar este libro como perdido? Esta acción no se puede deshacer.',
      async () => {
        setLoading(true);
        try {
          const response = await fetch(`${API_URL}/${borrowId}/lost`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ notes })
          });

          const data = await response.json();

          if (response.ok) {
            showSuccess('Libro marcado como perdido');
            fetchBorrows();
            fetchStats();
          } else {
            showSuccess(data.message || 'Error al marcar el libro como perdido');
          }
        } catch (error) {
          console.error('Error de conexión:', error);
          showSuccess('Error de conexión. Intenta de nuevo.');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // Validaciones
  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId.trim()) {
      newErrors.userId = 'El usuario es requerido';
    }

    if (!formData.bookId.trim()) {
      newErrors.bookId = 'El libro es requerido';
    }

    if (!formData.dueDate.trim()) {
      newErrors.dueDate = 'La fecha de vencimiento es requerida';
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate <= today) {
        newErrors.dueDate = 'La fecha de vencimiento debe ser futura';
      }
      
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 30);
      
      if (dueDate > maxDate) {
        newErrors.dueDate = 'La fecha de vencimiento no puede ser mayor a 30 días';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validación del formulario
    const newErrors = {};
    
    if (!formData.user) {
      newErrors.user = 'Debe seleccionar un usuario';
    }
    
    if (!formData.book) {
      newErrors.book = 'Debe seleccionar un libro';
    }
    
    if (!formData.loanDuration) {
      newErrors.loanDuration = 'Debe seleccionar la duración del préstamo';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const borrowData = {
        userId: formData.user,
        bookId: formData.book,
        dueDate: formData.dueDate,
        notes: formData.notes || ''
      };

      const url = editingBorrow 
        ? `http://localhost:5001/api/borrows/${editingBorrow._id}`
        : 'http://localhost:5001/api/borrows';
      
      const method = editingBorrow ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(borrowData),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess(editingBorrow ? 'Préstamo actualizado exitosamente' : 'Préstamo creado exitosamente');
        
        // Resetear formulario
        setFormData({
          user: '',
          book: '',
          borrowDate: new Date().toISOString().split('T')[0],
          loanDuration: '15',
          dueDate: '',
          administrator: currentAdmin,
          userDocument: '',
          userPhone: '',
          userEmail: '',
          notes: '',
          priority: 'normal'
        });
        
        setSelectedUser(null);
        setUserSearchTerm('');
        setEditingBorrow(null);
        setActiveTab('list');
        
        fetchBorrows();
        fetchStats();
      } else {
        setErrors(data.errors || { general: data.message });
      }
    } catch (error) {
      console.error('Error processing borrow:', error);
      setErrors({ general: 'Error al procesar el préstamo' });
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (submitted) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Función para buscar usuarios por nombre, username o email
  const handleUserSearch = (searchTerm) => {
    setUserSearchTerm(searchTerm);
    
    if (searchTerm.trim() === '') {
      setFilteredUsers([]);
      setShowUserDropdown(false);
      return;
    }

    const filtered = users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.fullName?.toLowerCase().includes(searchLower) ||
        // Búsqueda por nombre completo concatenado
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
      );
    });
    
    setFilteredUsers(filtered);
    setShowUserDropdown(filtered.length > 0);
  };

  // Función para seleccionar un usuario de la lista
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    const displayName = user.fullName || `${user.firstName} ${user.lastName}` || user.username;
    setUserSearchTerm(`${displayName} - ${user.email}`);
    setShowUserDropdown(false);
    
    setFormData(prev => ({
      ...prev,
      user: user._id,
      userDocument: user.username || '', // Usando username como documento
      userPhone: user.phone || '',
      userEmail: user.email || ''
    }));
  };

  // Manejar cambios en filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }));
    setCurrentPage(1);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Obtener clase de estado
  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'returned': return 'status-returned';
      case 'overdue': return 'status-overdue';
      case 'lost': return 'status-lost';
      default: return '';
    }
  };

  // Obtener texto de estado
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'returned': return 'Devuelto';
      case 'overdue': return 'Vencido';
      case 'lost': return 'Perdido';
      default: return status;
    }
  };

  // Efectos
  useEffect(() => {
    fetchBooks();
    fetchUsers();
    fetchStats();
    getCurrentAdmin();
  }, []);

  // Calcular fecha de devolución cuando cambia la duración del préstamo
  useEffect(() => {
    if (formData.borrowDate && formData.loanDuration) {
      const borrowDate = new Date(formData.borrowDate);
      const dueDate = new Date(borrowDate);
      dueDate.setDate(dueDate.getDate() + parseInt(formData.loanDuration));
      
      setFormData(prev => ({
        ...prev,
        dueDate: dueDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.borrowDate, formData.loanDuration]);

  useEffect(() => {
    fetchBorrows();
  }, [currentPage, filters]);

  // Obtener fecha mínima (mañana)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Obtener fecha máxima (30 días)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="authors-container">
      {/* Header con diseño unificado */}
      <div className="authors-header">
        <h1>Gestión de Préstamos</h1>
        <div className="tab-buttons">
          <button 
            className={activeTab === 'list' ? 'active' : ''}
            onClick={() => setActiveTab('list')}
          >
            Lista de Préstamos
          </button>
          <button 
            className={activeTab === 'create' ? 'active' : ''}
            onClick={() => setActiveTab('create')}
          >
            Nuevo Préstamo
          </button>
        </div>
      </div>

      {/* Divisor de contenido */}
      <div className="content-divider"></div>

      {/* Estadísticas */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Préstamos</h3>
          <p>{stats.totalPrestamos || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Préstamos Vencidos</h3>
          <p className="overdue">{stats.prestamosVencidos || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Activos</h3>
          <p>{stats.estadisticasPorEstado?.find(s => s._id === 'active')?.count || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Devueltos</h3>
          <p>{stats.estadisticasPorEstado?.find(s => s._id === 'returned')?.count || 0}</p>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === 'create' && (
        <div className="books-form">
    
          <form onSubmit={handleSubmit} className="book-form">
            <h2>
              {editingBorrow ? 'Editar Préstamo' : 'Nuevo Préstamo'}
            </h2>

            {/* Información del Sistema */}
            <div className="form-section">
              <h4 className="section-title">Información del Sistema</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="borrowDate">Fecha de Préstamo</label>
                  <input
                    type="date"
                    id="borrowDate"
                    name="borrowDate"
                    value={formData.borrowDate}
                    readOnly
                    className="readonly-input"
                    title="Fecha generada automáticamente por el sistema"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="administrator">Administrador</label>
                  <input
                    type="text"
                    id="administrator"
                    name="administrator"
                    value={formData.administrator}
                    readOnly
                    className="readonly-input"
                    title="Administrador que registra el préstamo"
                  />
                </div>
              </div>
            </div>

            {/* Información del Usuario */}
            <div className="form-section">
              <h4 className="section-title">Información del Usuario</h4>
              <div className="form-group user-search-container">
                <label htmlFor="userSearch">Buscar Usuario *</label>
                <input
                  type="text"
                  id="userSearch"
                  placeholder="Buscar por nombre, documento, email o teléfono..."
                  value={userSearchTerm}
                  onChange={(e) => handleUserSearch(e.target.value)}
                  onFocus={() => userSearchTerm && setShowUserDropdown(filteredUsers.length > 0)}
                  className="user-search-input"
                  required
                />
                {showUserDropdown && (
                  <div className="user-dropdown">
                    {filteredUsers.map(user => (
                      <div
                        key={user._id}
                        className="user-option"
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="user-name">{user.fullName || `${user.firstName} ${user.lastName}` || user.username}</div>
                        <div className="user-details">
                          {user.username && <span>Usuario: {user.username}</span>}
                          {user.email && <span>Email: {user.email}</span>}
                          {user.phone && <span>Tel: {user.phone}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.user && <span className="error-text">{errors.user}</span>}
              </div>

              {selectedUser && (
                <div className="selected-user-info">
                  <h5>Usuario Seleccionado:</h5>
                  <div className="user-info-grid">
                    <div><strong>Nombre:</strong> {selectedUser.fullName || `${selectedUser.firstName} ${selectedUser.lastName}` || selectedUser.username}</div>
                    <div><strong>Usuario:</strong> {selectedUser.username || 'No especificado'}</div>
                    <div><strong>Email:</strong> {selectedUser.email}</div>
                    <div><strong>Teléfono:</strong> {selectedUser.phone || 'No especificado'}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Información del Libro */}
            <div className="form-section">
              <h4 className="section-title">Información del Libro</h4>
              <div className="form-group">
                <label htmlFor="book">Libro *</label>
                <select
                  id="book"
                  name="book"
                  value={formData.book}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar libro</option>
                  {books.map(book => (
                    <option key={book._id} value={book._id}>
                      {book.title} - {book.author} (Disponibles: {book.availableCopies || 0})
                    </option>
                  ))}
                </select>
                {errors.book && <span className="error-text">{errors.book}</span>}
              </div>
            </div>

            {/* Configuración del Préstamo */}
            <div className="form-section">
              <h4 className="section-title">Configuración del Préstamo</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="loanDuration">Duración del Préstamo *</label>
                  <select
                    id="loanDuration"
                    name="loanDuration"
                    value={formData.loanDuration}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="7">7 días</option>
                    <option value="15">15 días</option>
                    <option value="30">30 días</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="dueDate">Fecha de Devolución</label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    readOnly
                    className="readonly-input calculated-date"
                    title="Fecha calculada automáticamente según la duración seleccionada"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Prioridad</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">Baja</option>
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notas Adicionales */}
            <div className="form-section">
              <h4 className="section-title">Información Adicional</h4>
              <div className="form-group">
                <label htmlFor="notes">Notas y Observaciones</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Notas adicionales sobre el préstamo, condiciones especiales, observaciones..."
                  rows="4"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Procesando...' : editingBorrow ? 'Actualizar Préstamo' : 'Crear Préstamo'}
              </button>
              {editingBorrow && (
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setEditingBorrow(null);
                    setFormData({
                      user: '',
                      book: '',
                      borrowDate: new Date().toISOString().split('T')[0],
                      loanDuration: '15',
                      dueDate: '',
                      administrator: currentAdmin,
                      userDocument: '',
                      userPhone: '',
                      userEmail: '',
                      notes: '',
                      priority: 'normal'
                    });
                    setSelectedUser(null);
                    setUserSearchTerm('');
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="booksSection">
          {/* Filtros */}
          <div className="filters">
            <div className="filter-group">
              <input
                type="text"
                name="search"
                placeholder="Buscar por usuario, libro, ISBN..."
                value={filters.search}
                onChange={handleFilterChange}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="returned">Devueltos</option>
                <option value="overdue">Vencidos</option>
                <option value="lost">Perdidos</option>
              </select>
            </div>

            <div className="filter-group">
              <select
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
              >
                <option value="">Todos los usuarios</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => {
                setFilters({
                  search: '',
                  status: '',
                  userId: '',
                  page: 1,
                  limit: 10
                });
                setCurrentPage(1);
              }}
              className="btn-secondary"
            >
              Limpiar Filtros
            </button>
          </div>

          {/* Lista de préstamos */}
          {loading ? (
            <div className="loading">Cargando préstamos...</div>
          ) : (
            <>
              <div className="books-grid">
                {borrows.length === 0 ? (
                  <div className="no-results">
                    <p>No se encontraron préstamos</p>
                  </div>
                ) : (
                  borrows.map(borrow => (
                    <div key={borrow._id} className="book-card-container">
                      <div className="book-card">
                        <div className="book-header">
                          <h3>{borrow.book?.title}</h3>
                          <span className={`status ${getStatusClass(borrow.status)}`}>
                            {getStatusText(borrow.status)}
                          </span>
                        </div>
                        
                        <div className="book-info">
                          <p><strong>Usuario:</strong> {borrow.user?.firstName} {borrow.user?.lastName}</p>
                          <p><strong>Autor:</strong> {borrow.book?.author}</p>
                          <p><strong>ISBN:</strong> {borrow.book?.isbn}</p>
                          <p><strong>Fecha de préstamo:</strong> {formatDate(borrow.borrowDate)}</p>
                          <p><strong>Fecha de vencimiento:</strong> {formatDate(borrow.dueDate)}</p>
                          {borrow.returnDate && (
                            <p><strong>Fecha de devolución:</strong> {formatDate(borrow.returnDate)}</p>
                          )}
                          {borrow.renewalCount > 0 && (
                            <p><strong>Renovaciones:</strong> {borrow.renewalCount}</p>
                          )}
                          {borrow.notes && (
                            <p><strong>Notas:</strong> {borrow.notes}</p>
                          )}
                        </div>

                        <div className="book-actions">
                          <button 
                            onClick={() => showBorrowDetails(borrow)}
                            className="btn-info"
                          >
                            Ver Detalles
                          </button>
                          <button 
                            onClick={() => openEditModal(borrow)}
                            className="btn-secondary"
                          >
                            Editar
                          </button>
                          {borrow.status === 'active' && (
                            <>
                              <button 
                                onClick={() => returnBook(borrow._id)}
                                className="btn-success"
                              >
                                Devolver
                              </button>
                              {borrow.renewalCount < 3 && (
                                <button 
                                  onClick={() => renewBorrow(borrow._id)}
                                  className="btn-warning"
                                >
                                  Renovar
                                </button>
                              )}
                              <button 
                                onClick={() => markAsLost(borrow._id)}
                                className="btn-danger"
                              >
                                Marcar Perdido
                              </button>
                            </>
                          )}
                          {borrow.status === 'overdue' && (
                            <>
                              <button 
                                onClick={() => returnBook(borrow._id)}
                                className="btn-success"
                              >
                                Devolver
                              </button>
                              <button 
                                onClick={() => markAsLost(borrow._id)}
                                className="btn-danger"
                              >
                                Marcar Perdido
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary"
                  >
                    Anterior
                  </button>
                  
                  <span className="page-info">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal de Detalles de Préstamo */}
      {showDetailModal && selectedBorrow && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles del Préstamo</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="borrow-details">
                <div className="detail-section">
                  <h3>📚 Información del Libro</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Título:</strong>
                      <span>{selectedBorrow.book?.title}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Autor:</strong>
                      <span>{selectedBorrow.book?.author}</span>
                    </div>
                    <div className="detail-item">
                      <strong>ISBN:</strong>
                      <span>{selectedBorrow.book?.isbn}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Género:</strong>
                      <span>{selectedBorrow.book?.genre}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>👤 Información del Usuario</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Nombre:</strong>
                      <span>{selectedBorrow.user?.firstName} {selectedBorrow.user?.lastName}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Email:</strong>
                      <span>{selectedBorrow.user?.email}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Teléfono:</strong>
                      <span>{selectedBorrow.user?.phone}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Documento:</strong>
                      <span>{selectedBorrow.user?.document}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>📅 Información del Préstamo</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Fecha de Préstamo:</strong>
                      <span>{formatDate(selectedBorrow.borrowDate)}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Fecha de Vencimiento:</strong>
                      <span>{formatDate(selectedBorrow.dueDate)}</span>
                    </div>
                    {selectedBorrow.returnDate && (
                      <div className="detail-item">
                        <strong>Fecha de Devolución:</strong>
                        <span>{formatDate(selectedBorrow.returnDate)}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <strong>Estado:</strong>
                      <span className={`status ${getStatusClass(selectedBorrow.status)}`}>
                        {getStatusText(selectedBorrow.status)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Renovaciones:</strong>
                      <span>{selectedBorrow.renewalCount || 0}</span>
                    </div>
                    {selectedBorrow.notes && (
                      <div className="detail-item full-width">
                        <strong>Notas:</strong>
                        <span>{selectedBorrow.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                Cerrar
              </button>
              {selectedBorrow.status === 'active' && (
                <>
                  <button 
                    className="btn-warning" 
                    onClick={() => {
                      setShowDetailModal(false);
                      openEditModal(selectedBorrow);
                    }}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn-success" 
                    onClick={() => {
                      setShowDetailModal(false);
                      returnBook(selectedBorrow._id);
                    }}
                  >
                    Devolver
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-container confirmation-modal">
            <div className="modal-header">
              <h2>⚠️ Confirmar Acción</h2>
            </div>
            <div className="modal-content">
              <p className="confirmation-message">{modalMessage}</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-danger" 
                onClick={handleConfirm}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showEditModal && selectedBorrow && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-container edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Editar Préstamo</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleEditSubmit} className="edit-form">
                <div className="form-group">
                  <label htmlFor="editDueDate">Nueva Fecha de Vencimiento</label>
                  <input
                    type="date"
                    id="editDueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={errors.dueDate ? 'error' : ''}
                  />
                  {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="editNotes">Notas</label>
                  <textarea
                    id="editNotes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Agregar notas sobre la edición del préstamo..."
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editPriority">Prioridad</label>
                  <select
                    id="editPriority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">Baja</option>
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={handleEditSubmit}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Éxito/Notificación */}
      {showSuccessModal && (
        <div className="toast-notification success">
          <div className="toast-content">
            <span className="toast-icon">✅</span>
            <span className="toast-message">{modalMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Borrow;

