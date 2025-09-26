const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  author: {
    type: String,
    required: [true, 'El autor es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre del autor no puede exceder 100 caracteres']
  },
  isbn: {
    type: String,
    required: [true, 'El ISBN es obligatorio'],
    trim: true,
    unique: true,
    validate: {
      validator: function(v) {
        // Validar ISBN-10 o ISBN-13
        const cleanISBN = v.replace(/[- ]/g, '');
        return /^(?:\d{10}|\d{13})$/.test(cleanISBN);
      },
      message: 'El ISBN debe tener 10 o 13 dígitos'
    }
  },
  publicationDate: {
    type: Date,
    required: [true, 'La fecha de publicación es obligatoria'],
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'La fecha de publicación no puede ser futura'
    }
  },
  genre: {
    type: String,
    required: [true, 'El género es obligatorio'],
    enum: [
      'ficcion',
      'no-ficcion',
      'ciencia-ficcion',
      'fantasia',
      'misterio',
      'romance',
      'terror',
      'biografia',
      'historia',
      'ciencia',
      'tecnologia',
      'infantil',
      'juvenil',
      'poesia',
      'teatro',
      'otros'
    ]
  },
  publisher: {
    type: String,
    required: [true, 'La editorial es obligatoria'],
    trim: true,
    maxlength: [100, 'El nombre de la editorial no puede exceder 100 caracteres']
  },
  pages: {
    type: Number,
    required: [true, 'El número de páginas es obligatorio'],
    min: [1, 'El número de páginas debe ser mayor a 0']
  },
  language: {
    type: String,
    required: [true, 'El idioma es obligatorio'],
    enum: ['español', 'ingles', 'frances', 'aleman', 'italiano', 'portugues', 'catalan', 'euskera', 'gallego', 'otros']
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true,
    minlength: [30, 'La descripción debe tener al menos 30 caracteres'],
    maxlength: [2000, 'La descripción no puede exceder 2000 caracteres']
  },
  coverImage: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Campo opcional
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v) || /^data:image\/.+;base64,/.test(v);
      },
      message: 'Debe ser una URL válida de imagen o imagen en base64'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para obtener el año de publicación
bookSchema.virtual('publicationYear').get(function() {
  return this.publicationDate ? this.publicationDate.getFullYear() : null;
});

// Virtual para verificar si es un libro reciente (últimos 5 años)
bookSchema.virtual('isRecent').get(function() {
  if (!this.publicationDate) return false;
  const currentYear = new Date().getFullYear();
  const bookYear = this.publicationDate.getFullYear();
  return (currentYear - bookYear) <= 5;
});

// Índices para búsquedas eficientes
bookSchema.index({ title: 'text', author: 'text', description: 'text' }, { 
  default_language: 'spanish',
  language_override: 'none'
});
bookSchema.index({ genre: 1 });
bookSchema.index({ language: 1 });
bookSchema.index({ isActive: 1 });
bookSchema.index({ isbn: 1 });
bookSchema.index({ publicationDate: 1 });

// Middleware pre-save para validaciones adicionales
bookSchema.pre('save', function(next) {
  // Convertir género a lowercase para consistencia
  if (this.genre) {
    this.genre = this.genre.toLowerCase();
  }
  
  // Convertir idioma a lowercase para consistencia
  if (this.language) {
    this.language = this.language.toLowerCase();
  }
  
  next();
});

// Método estático para buscar por género
bookSchema.statics.findByGenre = function(genre) {
  return this.find({ genre: genre.toLowerCase(), isActive: true });
};

// Método estático para buscar por idioma
bookSchema.statics.findByLanguage = function(language) {
  return this.find({ language: language.toLowerCase(), isActive: true });
};

// Método estático para buscar por autor
bookSchema.statics.findByAuthor = function(author) {
  return this.find({ 
    author: { $regex: author, $options: 'i' }, 
    isActive: true 
  });
};

// Método de instancia para obtener género formateado
bookSchema.methods.getFormattedGenre = function() {
  return this.genre.charAt(0).toUpperCase() + this.genre.slice(1).replace('-', ' ');
};

// Método de instancia para obtener idioma formateado
bookSchema.methods.getFormattedLanguage = function() {
  const languageMap = {
    'español': 'Español',
    'ingles': 'Inglés',
    'frances': 'Francés',
    'aleman': 'Alemán',
    'italiano': 'Italiano',
    'portugues': 'Portugués',
    'catalan': 'Catalán',
    'euskera': 'Euskera',
    'gallego': 'Gallego',
    'otros': 'Otros'
  };
  return languageMap[this.language] || this.language;
};

module.exports = mongoose.model('Book', bookSchema);