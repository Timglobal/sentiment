import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const treatmentScheduleSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
    index: true
  },
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
  treatmentType: {
    type: String,
    required: true,
    enum: [
      'consultation',
      'procedure',
      'surgery',
      'therapy',
      'checkup',
      'lab_work',
      'imaging',
      'emergency'
    ],
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  scheduledDate: {
    type: Date,
    required: true,
    index: true
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true,
    min: 15,
    max: 480 // 8 hours max
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled',
    index: true
  },
  location: {
    room: String,
    floor: String,
    building: String,
    notes: String
  },
  preparation: {
    instructions: String,
    medications: [String],
    restrictions: [String],
    requiredTests: [String]
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assistingStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  equipment: [{
    name: String,
    quantity: Number,
    reserved: {
      type: Boolean,
      default: false
    }
  }],
  reminders: {
    patient: {
      email: {
        enabled: { type: Boolean, default: true },
        sent: { type: Boolean, default: false },
        sentAt: Date,
        scheduledFor: Date
      },
      sms: {
        enabled: { type: Boolean, default: false },
        sent: { type: Boolean, default: false },
        sentAt: Date,
        scheduledFor: Date
      }
    },
    staff: {
      email: {
        enabled: { type: Boolean, default: true },
        sent: { type: Boolean, default: false },
        sentAt: Date,
        scheduledFor: Date
      },
      sms: {
        enabled: { type: Boolean, default: false },
        sent: { type: Boolean, default: false },
        sentAt: Date,
        scheduledFor: Date
      }
    }
  },
  results: {
    completed: { type: Boolean, default: false },
    notes: String,
    followUpRequired: { type: Boolean, default: false },
    followUpDate: Date,
    nextAppointment: Date,
    documents: [{
      name: String,
      path: String,
      uploadedAt: { type: Date, default: Date.now },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
  },
  billing: {
    estimated: Number,
    actual: Number,
    insuranceCovered: Number,
    patientResponsible: Number,
    billingStatus: {
      type: String,
      enum: ['pending', 'submitted', 'paid', 'overdue'],
      default: 'pending'
    }
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    department: {
      type: String,
      required: true,
      index: true
    },
    tags: [String],
    isRecurring: { type: Boolean, default: false },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly']
      },
      interval: Number,
      endDate: Date,
      occurrences: Number
    }
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
treatmentScheduleSchema.index({ scheduledDate: 1, status: 1 });
treatmentScheduleSchema.index({ patientId: 1, status: 1 });
treatmentScheduleSchema.index({ workerId: 1, scheduledDate: 1 });
treatmentScheduleSchema.index({ treatmentType: 1, status: 1 });
treatmentScheduleSchema.index({ 'metadata.department': 1, scheduledDate: 1 });
treatmentScheduleSchema.index({ priority: 1, scheduledDate: 1 });

// Compound indexes for complex queries
treatmentScheduleSchema.index({ 
  status: 1, 
  scheduledDate: 1, 
  'metadata.department': 1 
});

// Virtual populate for assignment details
treatmentScheduleSchema.virtual('assignment', {
  ref: 'Assignment',
  localField: 'assignmentId',
  foreignField: '_id',
  justOne: true
});

// Virtual populate for patient details
treatmentScheduleSchema.virtual('patient', {
  ref: 'User',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});

// Virtual populate for worker details
treatmentScheduleSchema.virtual('worker', {
  ref: 'User',
  localField: 'workerId',
  foreignField: '_id',
  justOne: true
});

// Virtual populate for doctor details
treatmentScheduleSchema.virtual('doctor', {
  ref: 'User',
  localField: 'assignedDoctor',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware
treatmentScheduleSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Validate that the assignment exists and is active
      const assignment = await mongoose.model('Assignment').findById(this.assignmentId);
      if (!assignment || assignment.status !== 'active') {
        return next(new Error('Invalid or inactive assignment'));
      }

      // Set department from assignment
      this.metadata.department = assignment.department;

      // Validate patient and worker exist
      const patient = await mongoose.model('User').findById(this.patientId);
      const worker = await mongoose.model('User').findById(this.workerId);

      if (!patient || patient.role !== 'patient') {
        return next(new Error('Invalid patient'));
      }

      if (!worker || worker.role !== 'staff') {
        return next(new Error('Invalid worker'));
      }

      // Check for scheduling conflicts
      const conflictingSchedule = await this.constructor.findOne({
        workerId: this.workerId,
        status: { $in: ['scheduled', 'in_progress'] },
        scheduledDate: {
          $gte: new Date(this.scheduledDate.getTime() - (this.estimatedDuration * 60000)),
          $lte: new Date(this.scheduledDate.getTime() + (this.estimatedDuration * 60000))
        }
      });

      if (conflictingSchedule) {
        return next(new Error('Scheduling conflict: Worker is not available at the requested time'));
      }

      // Set default reminder times
      if (!this.reminders.patient.email.scheduledFor) {
        // Patient email reminder 24 hours before
        this.reminders.patient.email.scheduledFor = new Date(
          this.scheduledDate.getTime() - (24 * 60 * 60 * 1000)
        );
      }

      if (!this.reminders.staff.email.scheduledFor) {
        // Staff email reminder 2 hours before
        this.reminders.staff.email.scheduledFor = new Date(
          this.scheduledDate.getTime() - (2 * 60 * 60 * 1000)
        );
      }

    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Static methods
treatmentScheduleSchema.statics.getTodaysSchedule = function(workerId, department = null) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const query = {
    scheduledDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['scheduled', 'in_progress'] }
  };

  if (workerId) {
    query.workerId = workerId;
  }

  if (department) {
    query['metadata.department'] = department;
  }

  return this.find(query)
    .populate('patient', 'name email')
    .populate('worker', 'name email')
    .populate('doctor', 'name email')
    .sort({ scheduledDate: 1 });
};

treatmentScheduleSchema.statics.getUpcomingTreatments = function(workerId, days = 7) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  return this.find({
    workerId,
    scheduledDate: { $gte: startDate, $lte: endDate },
    status: { $in: ['scheduled'] }
  })
    .populate('patient', 'name email')
    .populate('assignment', 'priority')
    .sort({ scheduledDate: 1 });
};

treatmentScheduleSchema.statics.getPendingReminders = function() {
  const now = new Date();
  
  return this.find({
    $or: [
      {
        'reminders.patient.email.enabled': true,
        'reminders.patient.email.sent': false,
        'reminders.patient.email.scheduledFor': { $lte: now }
      },
      {
        'reminders.staff.email.enabled': true,
        'reminders.staff.email.sent': false,
        'reminders.staff.email.scheduledFor': { $lte: now }
      }
    ],
    status: { $in: ['scheduled'] }
  })
    .populate('patient', 'name email')
    .populate('worker', 'name email');
};

// Add pagination plugin
treatmentScheduleSchema.plugin(mongoosePaginate);

// Create and export the model
const TreatmentSchedule = mongoose.model('TreatmentSchedule', treatmentScheduleSchema);
export default TreatmentSchedule;
