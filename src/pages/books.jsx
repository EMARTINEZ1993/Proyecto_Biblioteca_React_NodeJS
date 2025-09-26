import { useState, useEffect } from 'react';

import './books.css';

const API_URL = 'http://localhost:5001/api/books';
const AUTHORS_API_URL = 'http://localhost:5001/api/authors';

// Función para obtener headers con token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const Books = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publicationDate: '',
    genre: '',
    publisher: '',
    pages: '',
    language: '',
    description: '',
    imageUrl: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    language: '',
    page: 1,
    limit: 10
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Función para obtener autores de la API
  const fetchAuthors = async () => {
    try {
      const response = await fetch(AUTHORS_API_URL);
      const data = await response.json();
      
      if (response.ok) {
        setAuthors(data.data || []);
      } else {
        console.error('Error al obtener autores:', data.message);
      }
    } catch (error) {
      console.error('Error de conexión al obtener autores:', error);
    }
  };

  // Función para obtener libros de la API
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.genre) queryParams.append('genre', filters.genre);
      if (filters.language) queryParams.append('language', filters.language);
      queryParams.append('page', currentPage);
      queryParams.append('limit', filters.limit);

      const url = `${API_URL}?${queryParams}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setBooks(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.error('Error al obtener libros:', data.message);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para crear o actualizar un libro
  const saveBook = async (bookData) => {
    setLoading(true);
    try {
      const url = editingBook ? `${API_URL}/${editingBook._id}` : API_URL;
      const method = editingBook ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        fetchBooks(); // Recargar la lista
        resetForm();
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        setErrors({ submit: data.message || 'Error al guardar el libro' });
      }
    } catch (error) {
      setErrors({ submit: 'Error de conexión al servidor' });
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un libro
  const deleteBook = async (bookId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este libro?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${bookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBooks(); // Recargar la lista
      } else {
        const data = await response.json();
        console.error('Error al eliminar libro:', data.message);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para restaurar un libro eliminado
  const restoreBook = async (bookId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${bookId}/restore`, {
        method: 'PATCH',
      });

      if (response.ok) {
        fetchBooks(); // Recargar la lista
      } else {
        const data = await response.json();
        console.error('Error al restaurar libro:', data.message);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      publicationDate: '',
      genre: '',
      publisher: '',
      pages: '',
      language: '',
      description: '',
      imageUrl: ''
    });
    setEditingBook(null);
    setErrors({});
    setActiveTab('list');
  };

  // Funciones para manejar el modal
  const openBookModal = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const closeBookModal = () => {
    setSelectedBook(null);
    setShowModal(false);
  };

  // Función para editar un libro
  const editBook = (book) => {
    setFormData({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      publicationDate: book.publicationDate ? book.publicationDate.split('T')[0] : '',
      genre: book.genre || '',
      publisher: book.publisher || '',
      pages: book.pages || '',
      language: book.language || '',
      description: book.description || '',
      imageUrl: book.imageUrl || ''
    });
    setEditingBook(book);
    setActiveTab('form');
  };

  // useEffect para cargar libros al montar el componente
  useEffect(() => {
    fetchBooks();
  }, [filters, currentPage]);

  // useEffect para cargar autores al montar el componente
  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const isbnRegex = /^(?:\d{10}|\d{13})$/; // Validar ISBN-10 o ISBN-13
    
    if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!formData.author.trim()) newErrors.author = 'El autor es obligatorio';
    if (!formData.isbn.trim()) {
      newErrors.isbn = 'El ISBN es obligatorio';
    } else if (!isbnRegex.test(formData.isbn.replace(/[- ]/g, ''))) {
      newErrors.isbn = 'El ISBN debe tener 10 o 13 dígitos';
    }
    if (!formData.publicationDate) newErrors.publicationDate = 'La fecha de publicación es obligatoria';
    if (!formData.genre) newErrors.genre = 'Debe seleccionar un género';
    if (!formData.publisher.trim()) newErrors.publisher = 'La editorial es obligatoria';
    if (!formData.pages || formData.pages <= 0) newErrors.pages = 'El número de páginas debe ser válido';
    if (!formData.language) newErrors.language = 'Debe seleccionar un idioma';
    if (!formData.description.trim() || formData.description.length < 30) {
      newErrors.description = 'La descripción debe tener al menos 30 caracteres';
    }
    
    // Validación para URL de imagen (opcional pero debe ser válida si se proporciona)
    if (formData.imageUrl.trim()) {
      const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      if (!urlRegex.test(formData.imageUrl)) {
        newErrors.imageUrl = 'Debe ser una URL válida de imagen (jpg, jpeg, png, gif, webp)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Preparar datos para enviar a la API
      const bookData = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn.replace(/[- ]/g, ''), // Limpiar ISBN
        publicationDate: formData.publicationDate,
        genre: formData.genre,
        publisher: formData.publisher,
        pages: parseInt(formData.pages),
        language: formData.language,
        description: formData.description,
        coverImage: formData.imageUrl
      };
      
      saveBook(bookData);
    }
  };

  // Función para manejar cambios en los filtros
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
  };

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="authors-container">
      <div className="authors-header">
        <h1>Gestión de Libros</h1>
        <div className="tab-buttons">
          <button 
            className={activeTab === 'form' ? 'active' : ''}
            onClick={() => setActiveTab('form')}
          >
            {editingBook ? 'Editar Libro' : 'Nuevo Libro'}
          </button>
          <button 
            className={activeTab === 'list' ? 'active' : ''}
            onClick={() => setActiveTab('list')}
          >
            Lista de Libros
          </button>
        </div>
      </div>

      {/* División visual */}
      <div className="content-divider"></div>

      {submitted && (
        <div className="success-message">
          <h2>¡Libro {editingBook ? 'actualizado' : 'registrado'} con éxito!</h2>
          <p>Los datos han sido guardados correctamente.</p>
        </div>
      )}

      {errors.submit && (
        <div className="error-message">
          <p>{errors.submit}</p>
        </div>
      )}

      {activeTab === 'form' && (
        <form onSubmit={handleSubmit} className="books-form">
          <h2 className="form-title">
            {editingBook ? 'Editar Libro' : 'Registrar Nuevo Libro'}
          </h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Título *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="author">Autor *</label>
              <select
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className={errors.author ? 'error' : ''}
              >
                <option value="">Seleccione un autor</option>
                {authors.map(author => (
                  <option key={author._id} value={`${author.name} ${author.lastName}`}>
                    {author.name} {author.lastName}
                  </option>
                ))}
              </select>
              {errors.author && <span className="error-text">{errors.author}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="isbn">ISBN *</label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="10 o 13 dígitos"
                className={errors.isbn ? 'error' : ''}
              />
              {errors.isbn && <span className="error-text">{errors.isbn}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="publicationDate">Fecha de Publicación *</label>
              <input
                type="date"
                id="publicationDate"
                name="publicationDate"
                value={formData.publicationDate}
                onChange={handleChange}
                className={errors.publicationDate ? 'error' : ''}
              />
              {errors.publicationDate && <span className="error-text">{errors.publicationDate}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="genre">Género *</label>
              <select
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className={errors.genre ? 'error' : ''}
              >
                <option value="">Seleccione un género</option>
                <option value="ficcion">Ficción</option>
                <option value="no-ficcion">No ficción</option>
                <option value="misterio">Misterio</option>
                <option value="romance">Romance</option>
                <option value="ciencia-ficcion">Ciencia ficción</option>
                <option value="fantasia">Fantasía</option>
                <option value="biografia">Biografía</option>
                <option value="historia">Historia</option>
                <option value="autoayuda">Autoayuda</option>
                <option value="infantil">Infantil</option>
                <option value="juvenil">Juvenil</option>
                <option value="poesia">Poesía</option>
                <option value="teatro">Teatro</option>
                <option value="ensayo">Ensayo</option>
                <option value="otros">Otros</option>
              </select>
              {errors.genre && <span className="error-text">{errors.genre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="publisher">Editorial *</label>
              <input
                type="text"
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                className={errors.publisher ? 'error' : ''}
              />
              {errors.publisher && <span className="error-text">{errors.publisher}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pages">Número de Páginas *</label>
              <input
                type="number"
                id="pages"
                name="pages"
                value={formData.pages}
                onChange={handleChange}
                min="1"
                className={errors.pages ? 'error' : ''}
              />
              {errors.pages && <span className="error-text">{errors.pages}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="language">Idioma *</label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className={errors.language ? 'error' : ''}
              >
                <option value="">Seleccione un idioma</option>
                <option value="español">Español</option>
                <option value="ingles">Inglés</option>
                <option value="frances">Francés</option>
                <option value="aleman">Alemán</option>
                <option value="italiano">Italiano</option>
                <option value="portugues">Portugués</option>
                <option value="catalan">Catalán</option>
                <option value="euskera">Euskera</option>
                <option value="gallego">Gallego</option>
                <option value="otros">Otros</option>
              </select>
              {errors.language && <span className="error-text">{errors.language}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción del libro (opcional)"
              className={errors.description ? 'error' : ''}
            />
            <div className="char-count">
              {formData.description.length}/500 caracteres
            </div>
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">URL de la Imagen</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className={errors.imageUrl ? 'error' : ''}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {errors.imageUrl && <span className="error-text">{errors.imageUrl}</span>}
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (editingBook ? 'Actualizar Libro' : 'Registrar Libro')}
          </button>
        </form>
      )}

      {activeTab === 'list' && (
        <div className="booksSection">
          <div className="list-header">
            <div className="search-filters-inline">
              <input
                type="text"
                placeholder="Buscar libros por título, autor o descripción..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="search-input-inline"
              />
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="filter-select-inline"
              >
                <option value="">Todos los géneros</option>
                <option value="ficcion">Ficción</option>
                <option value="no-ficcion">No ficción</option>
                <option value="misterio">Misterio</option>
                <option value="romance">Romance</option>
                <option value="ciencia-ficcion">Ciencia ficción</option>
                <option value="fantasia">Fantasía</option>
                <option value="biografia">Biografía</option>
                <option value="historia">Historia</option>
                <option value="autoayuda">Autoayuda</option>
                <option value="infantil">Infantil</option>
                <option value="juvenil">Juvenil</option>
                <option value="poesia">Poesía</option>
                <option value="teatro">Teatro</option>
                <option value="ensayo">Ensayo</option>
                <option value="otros">Otros</option>
              </select>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="filter-select-inline"
              >
                <option value="">Todos los idiomas</option>
                <option value="español">Español</option>
                <option value="ingles">Inglés</option>
                <option value="frances">Francés</option>
                <option value="aleman">Alemán</option>
                <option value="italiano">Italiano</option>
                <option value="portugues">Portugués</option>
                <option value="catalan">Catalán</option>
                <option value="euskera">Euskera</option>
                <option value="gallego">Gallego</option>
                <option value="otros">Otros</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">Cargando libros...</div>
          ) : (
            <>
              <div className="books-grid">
                {books.map((book) => (
                  <div key={book._id} className="book-card-container">
                    <div className="genre-badge">{book.genre}</div>
                    <div className="book-card" onClick={() => openBookModal(book)}>
                        {/* Cara frontal - Imagen del libro */}
                        <div className="book-card-front">
                          <div className="book-image">
                            {book.coverImage ? (
                              <img src={book.coverImage} alt={book.title} />
                            ) : (
                              <div className="book-placeholder">
                                <div className="book-icon">📚</div>
                                <div className="book-title-overlay">{book.title}</div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Cara trasera - Información del libro */}
                        <div className="book-card-back">
                          <div className="book-info">
                            <h3>{book.title}</h3>
                            <div className="book-details">
                              <p><strong>Autor:</strong> {book.author}</p>
                              <p><strong>ISBN:</strong> {book.isbn}</p>
                              <p><strong>Género:</strong> {book.genre?.charAt(0).toUpperCase() + book.genre?.slice(1).replace('-', ' ')}</p>
                              <p><strong>Editorial:</strong> {book.publisher}</p>
                              <p><strong>Páginas:</strong> {book.pages}</p>
                              <p><strong>Idioma:</strong> {book.language?.charAt(0).toUpperCase() + book.language?.slice(1)}</p>
                              <p><strong>Publicación:</strong> {new Date(book.publicationDate).toLocaleDateString('es-ES', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</p>
                              {book.description && (
                                <div className="book-description">
                                  <strong>Descripción:</strong>
                                  <span className="description-text">{book.description}</span>
                                </div>
                              )}
                              {book.createdAt && (
                                <p className="book-meta"><strong>Agregado:</strong> {new Date(book.createdAt).toLocaleDateString('es-ES')}</p>
                              )}
                              {book.updatedAt && book.updatedAt !== book.createdAt && (
                                <p className="book-meta"><strong>Actualizado:</strong> {new Date(book.updatedAt).toLocaleDateString('es-ES')}</p>
                              )}
                              <p className="book-status">
                                <strong>Estado:</strong> 
                                <span className={`status-badge ${book.isActive ? 'active' : 'inactive'}`}>
                                  {book.isActive ? 'Activo' : 'Inactivo'}
                                </span>
                              </p>
                            </div>
                            
                            <div className="book-actions">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editBook(book);
                                }}
                                className="edit-btn"
                              >
                                Editar
                              </button>
                              {!book.isActive ? (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    restoreBook(book._id);
                                  }}
                                  className="restore-btn"
                                >
                                  Restaurar
                                </button>
                              ) : (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteBook(book._id);
                                  }}
                                  className="delete-btn"
                                >
                                  Eliminar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Anterior
                </button>
                <span className="page-info">Página {currentPage} de {totalPages}</span>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal para mostrar información detallada del libro */}
      {showModal && selectedBook && (
        <div className="modal-overlay" onClick={closeBookModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedBook.title}</h2>
              <button className="modal-close" onClick={closeBookModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-book-info">
                <div className="modal-book-image">
                  {selectedBook.coverImage ? (
                    <img src={selectedBook.coverImage} alt={selectedBook.title} />
                  ) : (
                    <div className="modal-book-placeholder">
                      <div className="book-icon">📚</div>
                    </div>
                  )}
                </div>
                
                <div className="modal-book-details">
                  <div className="detail-row">
                    <span className="detail-label">Autor:</span>
                    <span className="detail-value">{selectedBook.author}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">ISBN:</span>
                    <span className="detail-value">{selectedBook.isbn}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Género:</span>
                    <span className="detail-value">{selectedBook.genre?.charAt(0).toUpperCase() + selectedBook.genre?.slice(1).replace('-', ' ')}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Editorial:</span>
                    <span className="detail-value">{selectedBook.publisher}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Páginas:</span>
                    <span className="detail-value">{selectedBook.pages}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Idioma:</span>
                    <span className="detail-value">{selectedBook.language?.charAt(0).toUpperCase() + selectedBook.language?.slice(1)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Fecha de Publicación:</span>
                    <span className="detail-value">
                      {new Date(selectedBook.publicationDate).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Estado:</span>
                    <span className={`detail-value status-badge ${selectedBook.isActive ? 'active' : 'inactive'}`}>
                      {selectedBook.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  {selectedBook.createdAt && (
                    <div className="detail-row">
                      <span className="detail-label">Agregado:</span>
                      <span className="detail-value">{new Date(selectedBook.createdAt).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                  
                  {selectedBook.updatedAt && selectedBook.updatedAt !== selectedBook.createdAt && (
                    <div className="detail-row">
                      <span className="detail-label">Actualizado:</span>
                      <span className="detail-value">{new Date(selectedBook.updatedAt).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedBook.description && (
                <div className="modal-description">
                  <h3>Descripción</h3>
                  <p>{selectedBook.description}</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  closeBookModal();
                  editBook(selectedBook);
                }}
                className="modal-edit-btn"
              >
                Editar Libro
              </button>
              <button onClick={closeBookModal} className="modal-close-btn">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
