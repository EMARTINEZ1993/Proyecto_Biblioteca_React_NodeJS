const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio']
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'El libro es obligatorio']
  },
  borrowDate: {
    type: Date,
    default: Date.now,
    required: [true, 'La fecha de préstamo es obligatoria']
  },
  dueDate: {
    type: Date,
    required: [true, 'La fecha de vencimiento es obligatoria'],
    validate: {
      validator: function(v) {
        return v > this.borrowDate;
      },
      message: 'La fecha de vencimiento debe ser posterior a la fecha de préstamo'
    }
  },
  returnDate: {
    type: Date,
    default: null,
    validate: {
      validator: function(v) {
        if (v) {
          return v >= this.borrowDate;
        }
        return true;
      },
      message: 'La fecha de devolución debe ser posterior o igual a la fecha de préstamo'
    }
  },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue', 'lost'],
    default: 'active',
    required: [true, 'El estado es obligatorio']
  },
  notes: {
    type: String,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres'],
    trim: true
  },
  renewalCount: {
    type: Number,
    default: 0,
    min: [0, 'El número de renovaciones no puede ser negativo'],
    max: [3, 'No se pueden realizar más de 3 renovaciones']
  },
  fine: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'La multa no puede ser negativa']
    },
    paid: {
      type: Boolean,
      default: false
    },
    paidDate: {
      type: Date,
      default: null
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

// Virtual para calcular si el préstamo está vencido
borrowSchema.virtual('isOverdue').get(function() {
  if (this.status === 'returned' || this.status === 'lost') {
    return false;
  }
  return new Date() > this.dueDate;
});

// Virtual para calcular los días de retraso
borrowSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) {
    return 0;
  }
  const today = new Date();
  const diffTime = today - this.dueDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual para calcular los días restantes
borrowSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'returned' || this.status === 'lost') {
    return 0;
  }
  const today = new Date();
  const diffTime = this.dueDate - today;
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
});

// Virtual para obtener la duración del préstamo en días
borrowSchema.virtual('borrowDuration').get(function() {
  const endDate = this.returnDate || new Date();
  const diffTime = endDate - this.borrowDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Índices para optimizar consultas
borrowSchema.index({ user: 1 });
borrowSchema.index({ book: 1 });
borrowSchema.index({ status: 1 });
borrowSchema.index({ borrowDate: -1 });
borrowSchema.index({ dueDate: 1 });
borrowSchema.index({ isActive: 1 });
borrowSchema.index({ user: 1, status: 1 });
borrowSchema.index({ book: 1, status: 1 });

// Middleware pre-save para actualizar el estado automáticamente
borrowSchema.pre('save', function(next) {
  // Actualizar estado a vencido si es necesario
  if (this.status === 'active' && new Date() > this.dueDate) {
    this.status = 'overdue';
  }
  
  // Si se establece una fecha de devolución, cambiar estado a devuelto
  if (this.returnDate && this.status !== 'lost') {
    this.status = 'returned';
  }
  
  next();
});

// Métodos estáticos
borrowSchema.statics.findActiveByUser = function(userId) {
  return this.find({ 
    user: userId, 
    status: { $in: ['active', 'overdue'] },
    isActive: true 
  }).populate('book', 'title author isbn coverImage');
};

borrowSchema.statics.findOverdueLoans = function() {
  return this.find({
    status: 'overdue',
    isActive: true
  }).populate('user', 'username email firstName lastName')
    .populate('book', 'title author isbn');
};

borrowSchema.statics.findByBook = function(bookId) {
  return this.find({ 
    book: bookId,
    isActive: true 
  }).populate('user', 'username email firstName lastName');
};

// Métodos de instancia
borrowSchema.methods.renewLoan = function(additionalDays = 14) {
  if (this.renewalCount >= 3) {
    throw new Error('No se pueden realizar más renovaciones');
  }
  
  if (this.status !== 'active') {
    throw new Error('Solo se pueden renovar préstamos activos');
  }
  
  this.dueDate = new Date(this.dueDate.getTime() + (additionalDays * 24 * 60 * 60 * 1000));
  this.renewalCount += 1;
  
  return this.save();
};

borrowSchema.methods.returnBook = function(notes = '') {
  this.returnDate = new Date();
  this.status = 'returned';
  if (notes) {
    this.notes = notes;
  }
  
  return this.save();
};

borrowSchema.methods.calculateFine = function(finePerDay = 1000) {
  if (this.daysOverdue > 0) {
    this.fine.amount = this.daysOverdue * finePerDay;
  }
  return this.fine.amount;
};

module.exports = mongoose.model('Borrow', borrowSchema);