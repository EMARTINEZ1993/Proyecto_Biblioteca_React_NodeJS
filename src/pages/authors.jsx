import { useState, useEffect } from 'react';
import '../styles/authors.css';

const Authors = () => {
  // Estados principales
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNationality, setFilterNationality] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingAuthor, setEditingAuthor] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    nationality: '',
    genres: [],
    biography: '',
    photo: '',
    works: '',
    awards: '',
    language: '',
    socialLinks: '',
    birthDate: '',
    deathDate: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Estados de modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingAuthor, setViewingAuthor] = useState(null);

  // Opciones para los selects
  const nationalities = [
    'Colombiana', 'Ecuatoriana', 'Peruana', 'Venezolana', 'Argentina', 
    'Chilena', 'Mexicana', 'Española', 'Francesa', 'Italiana', 
    'Alemana', 'Inglesa', 'Estadounidense', 'Brasileña', 'Otra'
  ];

  const genres = [
    'Ficción', 'No-ficción', 'Ciencia', 'Tecnología', 'Fantasía',
    'Romance', 'Misterio', 'Thriller', 'Horror', 'Aventura',
    'Biografía', 'Historia', 'Filosofía', 'Poesía', 'Drama',
    'Comedia', 'Ciencia-ficción', 'Realismo-mágico', 'Novela-histórica',
    'Literatura-infantil', 'Literatura-juvenil', 'Ensayo', 'Crónica'
  ];

  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'Inglés' },
    { value: 'fr', label: 'Francés' },
    { value: 'pt', label: 'Portugués' },
    { value: 'de', label: 'Alemán' },
    { value: 'it', label: 'Italiano' },
    { value: 'otro', label: 'Otro' }
  ];

  // Mapeo de géneros: español (frontend) -> inglés (backend)
  const genreMapping = {
    'Ficción': 'ficcion',
    'No-ficción': 'no-ficcion',
    'Ciencia': 'ciencia',
    'Tecnología': 'tecnologia',
    'Fantasía': 'fantasia',
    'Romance': 'romance',
    'Misterio': 'misterio',
    'Thriller': 'thriller',
    'Horror': 'horror',
    'Aventura': 'aventura',
    'Biografía': 'biografia',
    'Historia': 'historia',
    'Filosofía': 'filosofia',
    'Poesía': 'poesia',
    'Drama': 'drama',
    'Comedia': 'comedia',
    'Ciencia-ficción': 'ciencia-ficcion',
    'Realismo-mágico': 'realismo-magico',
    'Novela-histórica': 'novela-historica',
    'Literatura-infantil': 'literatura-infantil',
    'Literatura-juvenil': 'literatura-juvenil',
    'Ensayo': 'ensayo',
    'Crónica': 'cronica'
  };

  // Mapeo inverso: inglés (backend) -> español (frontend)
  const reverseGenreMapping = Object.fromEntries(
    Object.entries(genreMapping).map(([key, value]) => [value, key])
  );

  // Mapeo de nacionalidades: mayúsculas (frontend) -> minúsculas (backend)
  const nationalityMapping = {
    'Colombiana': 'colombiana',
    'Ecuatoriana': 'ecuatoriana', 
    'Peruana': 'peruana',
    'Venezolana': 'venezolana',
    'Argentina': 'argentina',
    'Chilena': 'chilena',
    'Mexicana': 'mexicana',
    'Española': 'española',
    'Francesa': 'francesa',
    'Italiana': 'italiana',
    'Alemana': 'alemana',
    'Inglesa': 'inglesa',
    'Estadounidense': 'estadounidense',
    'Brasileña': 'brasileña',
    'Otra': 'otra'
  };

  // Mapeo inverso: minúsculas (backend) -> mayúsculas (frontend)
  const reverseNationalityMapping = Object.fromEntries(
    Object.entries(nationalityMapping).map(([key, value]) => [value, key])
  );

  // Cargar autores al montar el componente
  useEffect(() => {
    fetchAuthors();
  }, [currentPage, searchTerm, filterNationality, filterGenre]);

  // Función para obtener autores
  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filterNationality && { nationality: filterNationality }),
        ...(filterGenre && { genre: filterGenre })
      });

      const response = await fetch(`http://localhost:5001/api/authors?${params}`);
      const data = await response.json();

      if (data.success) {
        setAuthors(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Error al cargar autores:', data.message);
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const updatedGenres = checked
        ? [...formData.genres, value]
        : formData.genres.filter(genre => genre !== value);
      
      setFormData({
        ...formData,
        genres: updatedGenres
      });
    } else if (name === 'photo') {
      setFormData({
        ...formData,
        [name]: value
      });
      setImagePreview(value);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Manejar upload de imagen
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setFormData({
          ...formData,
          photo: base64
        });
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    // Validaciones que coinciden con el backend
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 50) {
      newErrors.name = 'El nombre debe tener entre 2 y 50 caracteres';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
    } else if (formData.lastName.trim().length < 2 || formData.lastName.trim().length > 50) {
      newErrors.lastName = 'El apellido debe tener entre 2 y 50 caracteres';
    }
    
    if (!formData.nationality) {
      newErrors.nationality = 'Debe seleccionar una nacionalidad';
    }
    
    if (formData.genres.length === 0) {
      newErrors.genres = 'Debe seleccionar al menos un género literario';
    }
    
    if (!formData.biography.trim()) {
      newErrors.biography = 'La biografía es obligatoria';
    } else if (formData.biography.trim().length < 50 || formData.biography.trim().length > 2000) {
      newErrors.biography = 'La biografía debe tener entre 50 y 2000 caracteres';
    }
    
    if (!formData.photo.trim()) {
      newErrors.photo = 'La fotografía es obligatoria';
    } else {
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      const base64Pattern = /^data:image\/.+;base64,/;
      
      if (!urlPattern.test(formData.photo) && !base64Pattern.test(formData.photo)) {
        newErrors.photo = 'Debe ser una URL válida de imagen o imagen en base64';
      }
    }
    
    if (!formData.language) {
      newErrors.language = 'El idioma principal es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Limpiar formulario
  const clearForm = () => {
    setFormData({
      name: '',
      lastName: '',
      nationality: '',
      genres: [],
      biography: '',
      photo: '',
      works: '',
      awards: '',
      language: '',
      socialLinks: '',
      birthDate: '',
      deathDate: ''
    });
    setErrors({});
    setImagePreview('');
    setEditingAuthor(null);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const url = editingAuthor 
        ? `http://localhost:5001/api/authors/${editingAuthor._id}`
        : 'http://localhost:5001/api/authors';
      
      const method = editingAuthor ? 'PUT' : 'POST';

      // Convertir géneros de español a inglés para el backend
      const mappedGenres = formData.genres.map(genre => genreMapping[genre] || genre);
      
      // Convertir nacionalidad de mayúsculas a minúsculas para el backend
      const mappedNationality = nationalityMapping[formData.nationality] || formData.nationality;
      
      const dataToSend = {
        ...formData,
        genres: mappedGenres,
        nationality: mappedNationality
      };

      // Remover campos de fecha vacíos para evitar errores de validación
      if (!dataToSend.birthDate || dataToSend.birthDate.trim() === '') {
        delete dataToSend.birthDate;
      }
      if (!dataToSend.deathDate || dataToSend.deathDate.trim() === '') {
        delete dataToSend.deathDate;
      }

      // Validar y corregir URLs de socialLinks
      if (dataToSend.socialLinks && dataToSend.socialLinks.trim() !== '') {
        let socialLink = dataToSend.socialLinks.trim();
        // Si no tiene protocolo, agregar https://
        if (!socialLink.startsWith('http://') && !socialLink.startsWith('https://')) {
          socialLink = 'https://' + socialLink;
        }
        dataToSend.socialLinks = socialLink;
      } else {
        // Si está vacío, remover el campo
        delete dataToSend.socialLinks;
      }



      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        clearForm();
        fetchAuthors();
        setActiveTab('list');
        
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        console.error('Error al guardar autor:', data.message);
        if (data.errors) {
          const formErrors = {};
          data.errors.forEach(error => {
            formErrors[error.path] = error.msg;
          });
          setErrors(formErrors);
        }
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    } finally {
      setLoading(false);
    }
  };

  // Editar autor
  const handleEdit = (author) => {
    // Convertir géneros de inglés a español para mostrar en el frontend
    const mappedGenres = author.genres.map(genre => reverseGenreMapping[genre] || genre);
    
    // Convertir nacionalidad de minúsculas a mayúsculas para mostrar en el frontend
    const mappedNationality = reverseNationalityMapping[author.nationality] || author.nationality;
    
    setFormData({
      name: author.name,
      lastName: author.lastName,
      nationality: mappedNationality,
      genres: mappedGenres,
      biography: author.biography,
      photo: author.photo,
      works: author.works || '',
      awards: author.awards || '',
      language: author.language,
      socialLinks: author.socialLinks || '',
      birthDate: author.birthDate ? author.birthDate.split('T')[0] : '',
      deathDate: author.deathDate ? author.deathDate.split('T')[0] : ''
    });
    setImagePreview(author.photo);
    setEditingAuthor(author);
    setActiveTab('form');
  };

  // Confirmar eliminación
  const confirmDelete = (author) => {
    setAuthorToDelete(author);
    setShowDeleteModal(true);
  };

  // Eliminar autor
  const handleDelete = async () => {
    if (!authorToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/authors/${authorToDelete._id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        fetchAuthors();
        setShowDeleteModal(false);
        setAuthorToDelete(null);
      } else {
        console.error('Error al eliminar autor:', data.message);
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ver detalles del autor
  const viewAuthor = (author) => {
    setViewingAuthor(author);
    setShowViewModal(true);
  };

  // Formatear géneros
  const formatGenres = (genres) => {
    return genres.map(genre => 
      genre.charAt(0).toUpperCase() + genre.slice(1).replace('-', ' ')
    ).join(', ');
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="authors-container">
      <div className="authors-header">
        <h1>Gestión de Autores</h1>
        <div className="tab-buttons">
          <button 
            className={activeTab === 'form' ? 'active' : ''}
            onClick={() => setActiveTab('form')}
          >
            {editingAuthor ? 'Editar Autor' : 'Nuevo Autor'}
          </button>
          <button 
            className={activeTab === 'list' ? 'active' : ''}
            onClick={() => setActiveTab('list')}
          >
            Lista de Autores
          </button>
        </div>
      </div>
      <div className="content-divider"></div>
      {submitted && (
        <div className="success-message">
          ¡Autor {editingAuthor ? 'actualizado' : 'guardado'} exitosamente!
        </div>
      )}

      {activeTab === 'form' && (
        <div className="form-section">
          <form onSubmit={handleSubmit} className="author-form">
            {/* Fila 1: Nombre y Apellido */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nombre:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                   className={errors.name ? 'error' : ''}
                   placeholder="Nombre del autor"
                 />
                 {errors.name && <span className="error-text">{errors.name}</span>}
               </div>

               <div className="form-group">
                 <label htmlFor="lastName">Apellido:</label>
                 <input
                   type="text"
                   id="lastName"
                   name="lastName"
                   value={formData.lastName}
                   onChange={handleInputChange}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Apellido del autor"
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>

            {/* Fila 2: Nacionalidad y Foto */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nationality">Nacionalidad:</label>
                <select
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                   className={errors.nationality ? 'error' : ''}
                 >
                   <option value="">Seleccionar nacionalidad</option>
                   {nationalities.map(country => (
                     <option key={country} value={country}>{country}</option>
                   ))}
                 </select>
                 {errors.nationality && <span className="error-text">{errors.nationality}</span>}
               </div>

               <div className="form-group">
                 <label htmlFor="photo">Foto del Autor:</label>
                 <input
                   type="url"
                   id="photo"
                   name="photo"
                   value={formData.photo}
                   onChange={handleInputChange}
                  placeholder="URL de la imagen del autor"
                  className={errors.photo ? 'error' : ''}
                />
                {errors.photo && <span className="error-text">{errors.photo}</span>}
              </div>
            </div>

            {/* Vista previa de imagen */}
            {imagePreview && (
              <div className="image-preview-container">
                <div className="image-preview">
                  <img src={imagePreview} alt="Vista previa" />
                </div>
              </div>
            )}

            {/* Fila 3: Fechas */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="birthDate">Fecha de Nacimiento:</label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                 />
               </div>

               <div className="form-group">
                 <label htmlFor="deathDate">Fecha de Fallecimiento:</label>
                 <input
                   type="date"
                   id="deathDate"
                   name="deathDate"
                   value={formData.deathDate}
                   onChange={handleInputChange}
                />
                <small>Dejar vacío si está vivo</small>
              </div>
            </div>

            {/* Idioma */}
            <div className="form-group">
              <label htmlFor="language">Idioma Principal:</label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className={errors.language ? 'error' : ''}
              >
                <option value="">Seleccionar idioma</option>
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              {errors.language && <span className="error-text">{errors.language}</span>}
            </div>

             {/* Géneros Literarios */}
             <div className="form-group">
               <label>Géneros Literarios:</label>
               <div className="genres-grid">
                 {genres.map(genre => (
                  <label key={genre} className="genre-checkbox">
                    <input
                      type="checkbox"
                      value={genre}
                      checked={formData.genres.includes(genre)}
                      onChange={handleInputChange}
                    />
                    {genre.charAt(0).toUpperCase() + genre.slice(1).replace('-', ' ')}
                  </label>
                ))}
              </div>
              {errors.genres && <span className="error-text">{errors.genres}</span>}
            </div>

            {/* Biografía */}
            <div className="form-group">
              <label htmlFor="biography">Biografía:</label>
              <textarea
                id="biography"
                name="biography"
                value={formData.biography}
                onChange={handleInputChange}
                 rows="4"
                 placeholder="Escriba una biografía de al menos 50 caracteres..."
                 className={errors.biography ? 'error' : ''}
               />
               <small>Caracteres: {formData.biography.length}/50 mínimo</small>
               {errors.biography && <span className="error-text">{errors.biography}</span>}
             </div>

             {/* Obras */}
             <div className="form-group">
               <label htmlFor="works">Obras Principales:</label>
               <textarea
                 id="works"
                 name="works"
                 value={formData.works}
                 onChange={handleInputChange}
                 rows="3"
                 placeholder="Lista las obras más importantes del autor..."
               />
             </div>

             {/* Premios */}
             <div className="form-group">
               <label htmlFor="awards">Premios y Reconocimientos:</label>
               <textarea
                 id="awards"
                 name="awards"
                 value={formData.awards}
                 onChange={handleInputChange}
                 rows="2"
                 placeholder="Premios, reconocimientos y distinciones..."
               />
             </div>

             {/* Redes Sociales */}
             <div className="form-group">
               <label htmlFor="socialLinks">Enlaces Sociales:</label>
               <input
                 type="text"
                 id="socialLinks"
                 name="socialLinks"
                 value={formData.socialLinks}
                 onChange={handleInputChange}
                placeholder="Enlaces a redes sociales o sitio web (separados por comas)"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Guardando...' : (editingAuthor ? 'Actualizar Autor' : 'Guardar Autor')}
              </button>
              {editingAuthor && (
                <button type="button" onClick={clearForm} className="btn-secondary">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="list-section">
          <div className="list-header">
            <div className="search-filters-inline">
              <input
                type="text"
                placeholder="Buscar autores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-inline"
              />
              <select
                value={filterNationality}
                onChange={(e) => setFilterNationality(e.target.value)}
                className="filter-select-inline"
              >
                <option value="">Todas las nacionalidades</option>
                {nationalities.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                className="filter-select-inline"
              >
                <option value="">Todos los géneros</option>
                {genres.map(genre => (
                  <option key={genre} value={genreMapping[genre]}>{genre}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">Cargando autores...</div>
          ) : (
            <>
              <div className="authors-grid">
                {authors.map(author => (
                  <div key={author._id} className="author-card">
                    <div className="author-image" onClick={() => viewAuthor(author)}>
                      <img src={author.photo} alt={`${author.name} ${author.lastName}`} />
                    </div>
                    <div className="author-info">
                      <h3>{author.name} {author.lastName}</h3>
                      <p className="nationality">{author.nationality}</p>
                      <p className="genres">{formatGenres(author.genres)}</p>
                      <p className="dates">
                        {formatDate(author.birthDate)} - {formatDate(author.deathDate)}
                      </p>

                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                  <span>Página {currentPage} de {totalPages}</span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar Eliminación</h3>
            <p>¿Está seguro de que desea eliminar al autor "{authorToDelete?.name} {authorToDelete?.lastName}"?</p>
            <div className="modal-buttons">
              <button onClick={handleDelete} className="btn-danger">
                Eliminar
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vista de autor */}
      {showViewModal && viewingAuthor && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h3>{viewingAuthor.name} {viewingAuthor.lastName}</h3>
              <button onClick={() => setShowViewModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-content">
              <div className="author-details">
                <div className="author-photo">
                  <img src={viewingAuthor.photo} alt={`${viewingAuthor.name} ${viewingAuthor.lastName}`} />
                </div>
                <div className="author-data">
                  <p><strong>Nacionalidad:</strong> {viewingAuthor.nationality}</p>
                  <p><strong>Idioma:</strong> {viewingAuthor.language}</p>
                  <p><strong>Géneros:</strong> {formatGenres(viewingAuthor.genres)}</p>
                  <p><strong>Nacimiento:</strong> {formatDate(viewingAuthor.birthDate)}</p>
                  {viewingAuthor.deathDate && (
                    <p><strong>Fallecimiento:</strong> {formatDate(viewingAuthor.deathDate)}</p>
                  )}
                </div>
              </div>
              <div className="biography-section">
                <h4>Biografía</h4>
                <p>{viewingAuthor.biography}</p>
              </div>
              {viewingAuthor.works && (
                <div className="works-section">
                  <h4>Obras Principales</h4>
                  <p>{viewingAuthor.works}</p>
                </div>
              )}
              {viewingAuthor.awards && (
                <div className="awards-section">
                  <h4>Premios y Reconocimientos</h4>
                  <p>{viewingAuthor.awards}</p>
                </div>
              )}
              <div className="modal-actions">
                <button 
                  onClick={() => {
                    handleEdit(viewingAuthor);
                    setShowViewModal(false);
                  }} 
                  className="btn-edit-modal"
                >
                  Editar Autor
                </button>
                <button 
                  onClick={() => {
                    confirmDelete(viewingAuthor);
                    setShowViewModal(false);
                  }} 
                  className="btn-delete-modal"
                >
                  Eliminar Autor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Authors;
