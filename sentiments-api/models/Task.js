import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'overdue'],
    default: 'pending',
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  estimatedHours: {
    type: Number,
    min: 0.1,
    max: 1000
  },
  actualHours: {
    type: Number,
    min: 0,
    max: 1000
  },
  tags: [{
    type: String,
    trim: true
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  notes: [{
    content: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedAt: {
    type: Date
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Index for better query performance
taskSchema.index({ userId: 1, status: 1 })
taskSchema.index({ dueDate: 1 })
taskSchema.index({ priority: 1, status: 1 })
taskSchema.index({ category: 1 })

// Virtual to check if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'completed'
})

// Update status to overdue automatically
taskSchema.pre('find', function() {
  this.updateMany(
    { 
      dueDate: { $lt: new Date() }, 
      status: { $nin: ['completed', 'overdue'] } 
    },
    { status: 'overdue' }
  )
})

taskSchema.pre('findOne', function() {
  this.updateOne(
    { 
      dueDate: { $lt: new Date() }, 
      status: { $nin: ['completed', 'overdue'] } 
    },
    { status: 'overdue' }
  )
})

// Auto-populate user information
taskSchema.pre(['find', 'findOne'], function() {
  this.populate('userId', 'name email role')
  this.populate('assignedTo', 'name email role')
  this.populate('notes.createdBy', 'name email')
})

export default mongoose.model('Task', taskSchema)
