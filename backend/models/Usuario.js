const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  id_type: {
    type: String,
    required: [true, 'El tipo de identificación es obligatorio'],
    enum: ['CC', 'TI', 'CE', 'NIT']
  },
  id: {
    type: String,
    required: [true, 'La identificación es obligatoria'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  lastname: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'La dirección es obligatoria'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true
  },
  birthDate: {
    type: Date,
    required: [true, 'La fecha de nacimiento es obligatoria']
  },
  gender: {
    type: String,
    required: [true, 'El género es obligatorio'],
    enum: ['Masculino', 'Femenino', 'Otro']
  }
}, {
  timestamps: true,
  collection: 'usuarios'
});

// Índices para mejorar las consultas
usuarioSchema.index({ id: 1 });
usuarioSchema.index({ email: 1 });
usuarioSchema.index({ name: 1, lastname: 1 });

// Virtual para nombre completo
usuarioSchema.virtual('fullName').get(function() {
  return `${this.name} ${this.lastname}`;
});

// Método para calcular la edad
usuarioSchema.methods.getAge = function() {
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Configurar toJSON para incluir virtuals
usuarioSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Usuario', usuarioSchema);