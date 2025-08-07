import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const assignmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'suspended', 'cancelled'],
    default: 'active',
    index: true
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  // Medical notes added by staff
  medicalNotes: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    type: {
      type: String,
      enum: ['consultation', 'treatment', 'observation', 'emergency'],
      default: 'consultation'
    },
    title: {
      type: String,
      required: true,
      maxlength: 200
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    treatmentScheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TreatmentSchedule'
    }
  }],
  // Treatment plan for patient
  treatmentPlan: {
    medications: [{
      type: String,
      maxlength: 200
    }],
    instructions: {
      type: String,
      maxlength: 1000
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  // Additional metadata
  metadata: {
    assignmentType: {
      type: String,
      default: 'standard'
    },
    estimatedDuration: Number, // in hours
    actualDuration: Number, // in hours
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
assignmentSchema.index({ patientId: 1, status: 1 });
assignmentSchema.index({ workerId: 1, status: 1 });
assignmentSchema.index({ department: 1, status: 1 });
assignmentSchema.index({ createdAt: -1 });
assignmentSchema.index({ priority: 1, status: 1 });
assignmentSchema.index({ assignedBy: 1 });

// Compound index for common queries
assignmentSchema.index({ status: 1, department: 1, priority: -1 });

// Virtual populate for patient details
assignmentSchema.virtual('patient', {
  ref: 'User',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});

// Virtual populate for worker details
assignmentSchema.virtual('worker', {
  ref: 'User',
  localField: 'workerId',
  foreignField: '_id',
  justOne: true
});

// Virtual populate for assignedBy details
assignmentSchema.virtual('assignedByUser', {
  ref: 'User',
  localField: 'assignedBy',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to validate assignment rules
assignmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Check if patient exists and has 'patient' role
      const patient = await mongoose.model('User').findById(this.patientId);
      if (!patient || patient.role !== 'patient') {
        return next(new Error('Invalid patient ID or user is not a patient'));
      }

      // Check if worker exists and has 'staff' role
      const worker = await mongoose.model('User').findById(this.workerId);
      if (!worker || worker.role !== 'staff') {
        return next(new Error('Invalid worker ID or user is not a staff member'));
      }

      // Ensure departments match
      // if (patient.department !== worker.department) {
      //   return next(new Error('Patient and worker must be in the same department'));
      // }

      this.department = patient.department;

      // Check for existing active assignment between same patient and worker
      const existingAssignment = await this.constructor.findOne({
        patientId: this.patientId,
        workerId: this.workerId,
        status: 'active'
      });

      if (existingAssignment) {
        return next(new Error('An active assignment already exists between this patient and worker'));
      }
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Static methods for common queries
assignmentSchema.statics.getActiveAssignments = function() {
  return this.find({ status: 'active' })
    .populate('patient', 'name email department')
    .populate('worker', 'name email department role')
    .populate('assignedByUser', 'name email')
    .sort({ priority: -1, createdAt: -1 });
};

assignmentSchema.statics.getAssignmentsByWorker = function(workerId) {
  return this.find({ workerId, status: 'active' })
    .populate('patient', 'name email department')
    .sort({ priority: -1, createdAt: -1 });
};

assignmentSchema.statics.getAssignmentsByPatient = function(patientId) {
  return this.find({ patientId })
    .populate('worker', 'name email department role')
    .populate('assignedByUser', 'name email')
    .sort({ createdAt: -1 });
};

assignmentSchema.statics.getAssignmentsByDepartment = function(department) {
  return this.find({ department })
    .populate('patient', 'name email')
    .populate('worker', 'name email role')
    .sort({ priority: -1, createdAt: -1 });
};

assignmentSchema.statics.getAssignmentStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalAssignments: { $sum: 1 },
        activeAssignments: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        completedAssignments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        suspendedAssignments: {
          $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] }
        },
        urgentAssignments: {
          $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
        },
        highPriorityAssignments: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalAssignments: 0,
    activeAssignments: 0,
    completedAssignments: 0,
    suspendedAssignments: 0,
    urgentAssignments: 0,
    highPriorityAssignments: 0
  };
};

assignmentSchema.statics.getDepartmentStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$department',
        totalAssignments: { $sum: 1 },
        activeAssignments: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        }
      }
    },
    { $sort: { totalAssignments: -1 } }
  ]);
};

// Virtual field to populate patient info
assignmentSchema.virtual('patient', {
  ref: 'User',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});

// Virtual field to populate worker info  
assignmentSchema.virtual('worker', {
  ref: 'User',
  localField: 'workerId',
  foreignField: '_id',
  justOne: true
});

// Virtual field to populate assigned by user info
assignmentSchema.virtual('assignedByUser', {
  ref: 'User',
  localField: 'assignedBy',
  foreignField: '_id',
  justOne: true
});

// Add pagination plugin
assignmentSchema.plugin(mongoosePaginate);

// Create and export the model
const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
