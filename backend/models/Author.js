const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  lastName: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true,
    maxlength: [50, 'El apellido no puede exceder 50 caracteres']
  },
  nationality: {
    type: String,
    required: [true, 'La nacionalidad es obligatoria'],
    enum: [
      'colombiana', 'ecuatoriana', 'peruana', 'venezolana', 'argentina', 
      'chilena', 'mexicana', 'española', 'francesa', 'italiana', 
      'alemana', 'inglesa', 'estadounidense', 'brasileña', 'otra'
    ]
  },
  genres: [{
    type: String,
    enum: [
      'ficcion', 'no-ficcion', 'ciencia', 'tecnologia', 'fantasia',
      'romance', 'misterio', 'thriller', 'horror', 'aventura',
      'biografia', 'historia', 'filosofia', 'poesia', 'drama',
      'comedia', 'ciencia-ficcion', 'realismo-magico', 'novela-historica',
      'literatura-infantil', 'literatura-juvenil', 'ensayo', 'cronica'
    ],
    required: true
  }],
  biography: {
    type: String,
    required: [true, 'La biografía es obligatoria'],
    minlength: [50, 'La biografía debe tener al menos 50 caracteres'],
    maxlength: [2000, 'La biografía no puede exceder 2000 caracteres']
  },
  photo: {
    type: String,
    required: [true, 'La fotografía es obligatoria'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v) || /^data:image\/.+;base64,/.test(v);
      },
      message: 'Debe ser una URL válida de imagen o imagen en base64'
    }
  },
  works: {
    type: String,
    maxlength: [1000, 'Las obras no pueden exceder 1000 caracteres']
  },
  awards: {
    type: String,
    maxlength: [1000, 'Los premios no pueden exceder 1000 caracteres']
  },
  language: {
    type: String,
    required: [true, 'El idioma principal es obligatorio'],
    enum: ['es', 'en', 'fr', 'pt', 'de', 'it', 'otro']
  },
  socialLinks: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Campo opcional
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Debe ser una URL válida'
    }
  },
  birthDate: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true; // Campo opcional
        return v <= new Date();
      },
      message: 'La fecha de nacimiento no puede ser futura'
    }
  },
  deathDate: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true; // Campo opcional
        return v <= new Date() && (!this.birthDate || v >= this.birthDate);
      },
      message: 'La fecha de fallecimiento debe ser válida'
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

// Virtual para nombre completo
authorSchema.virtual('fullName').get(function() {
  return `${this.name} ${this.lastName}`;
});

// Virtual para verificar si está vivo
authorSchema.virtual('isAlive').get(function() {
  return !this.deathDate;
});

// Índices para búsquedas eficientes
authorSchema.index({ name: 1, lastName: 1 });
authorSchema.index({ nationality: 1 });
authorSchema.index({ genres: 1 });
authorSchema.index({ language: 1 });
authorSchema.index({ isActive: 1 });

// Middleware pre-save para validaciones adicionales
authorSchema.pre('save', function(next) {
  // Convertir géneros a lowercase para consistencia
  if (this.genres) {
    this.genres = this.genres.map(genre => genre.toLowerCase());
  }
  
  // Validar que la fecha de muerte sea posterior a la de nacimiento
  if (this.birthDate && this.deathDate && this.deathDate <= this.birthDate) {
    return next(new Error('La fecha de fallecimiento debe ser posterior a la fecha de nacimiento'));
  }
  
  next();
});

// Método estático para buscar por género
authorSchema.statics.findByGenre = function(genre) {
  return this.find({ genres: genre, isActive: true });
};

// Método estático para buscar por nacionalidad
authorSchema.statics.findByNationality = function(nationality) {
  return this.find({ nationality: nationality, isActive: true });
};

// Método de instancia para obtener géneros formateados
authorSchema.methods.getFormattedGenres = function() {
  return this.genres.map(genre => 
    genre.charAt(0).toUpperCase() + genre.slice(1).replace('-', ' ')
  ).join(', ');
};

module.exports = mongoose.model('Author', authorSchema);