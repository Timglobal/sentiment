import TreatmentSchedule from '../models/TreatmentSchedule.js';
import Assignment from '../models/Assignment.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import { scheduleEmailReminder, cancelScheduledEmail } from '../utils/scheduler.js';

// Get treatment schedules with filtering and pagination
const getTreatmentSchedules = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      status,
      treatmentType,
      priority,
      workerId,
      patientId,
      startDate,
      endDate,
      department
    } = req.query;

    const query = {};
    
    // Apply filters
    if (status) query.status = status;
    if (treatmentType) query.treatmentType = treatmentType;
    if (priority) query.priority = priority;
    if (workerId) query.workerId = workerId;
    if (patientId) query.patientId = patientId;
    if (department) query['metadata.department'] = department;

    // Date range filter
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { scheduledDate: 1 },
      populate: [
        { path: 'patient', select: 'name email department' },
        { path: 'worker', select: 'name email department' },
        { path: 'doctor', select: 'name email department' },
        { path: 'assignment', select: 'priority status notes' }
      ]
    };

    const result = await TreatmentSchedule.paginate(query, options);

    res.json({
      success: true,
      data: {
        schedules: result.docs,
        pagination: {
          page: result.page,
          pages: result.totalPages,
          total: result.totalDocs,
          limit: result.limit,
          hasNext: result.hasNextPage,
          hasPrev: result.hasPrevPage
        }
      }
    });
  } catch (error) {
    console.error('Get treatment schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch treatment schedules',
      error: error.message
    });
  }
};

// Get treatment schedule by ID
const getTreatmentScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const schedule = await TreatmentSchedule.findById(id)
      .populate('patient', 'name email department')
      .populate('worker', 'name email department')
      .populate('doctor', 'name email department')
      .populate('assignment', 'priority status notes')
      .populate('assistingStaff', 'name email role');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Treatment schedule not found'
      });
    }

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Get treatment schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch treatment schedule',
      error: error.message
    });
  }
};

// Create new treatment schedule
const createTreatmentSchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      assignmentId,
      treatmentType,
      title,
      description,
      scheduledDate,
      estimatedDuration,
      priority = 'normal',
      location,
      preparation,
      assignedDoctor,
      reminders
    } = req.body;

    // Verify assignment exists and get patient/worker info
    const assignment = await Assignment.findById(assignmentId)
      .populate('patient')
      .populate('worker');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignment.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot schedule treatment for inactive assignment'
      });
    }

    const scheduleData = {
      assignmentId,
      patientId: assignment.patientId,
      workerId: assignment.workerId,
      treatmentType,
      title,
      description,
      scheduledDate: new Date(scheduledDate),
      estimatedDuration,
      priority,
      location,
      preparation,
      assignedDoctor: assignedDoctor || assignment.workerId,
      reminders: reminders || {},
      metadata: {
        createdBy: req.user.userId,
        department: assignment.department
      }
    };

    const schedule = new TreatmentSchedule(scheduleData);
    await schedule.save();

    // Populate the created schedule
    await schedule.populate([
      { path: 'patient', select: 'name email department' },
      { path: 'worker', select: 'name email department' },
      { path: 'doctor', select: 'name email department' },
      { path: 'assignment', select: 'priority status notes' }
    ]);

    // Schedule email reminders using agenda
    if (schedule.reminders.patient.email.enabled) {
      await scheduleEmailReminder({
        type: 'patient_treatment_reminder',
        scheduleId: schedule._id,
        recipientId: schedule.patientId,
        scheduledFor: schedule.reminders.patient.email.scheduledFor,
        data: {
          patientName: assignment.patient.name,
          treatmentType: schedule.treatmentType,
          scheduledDate: schedule.scheduledDate,
          location: schedule.location
        }
      });
    }

    if (schedule.reminders.staff.email.enabled) {
      await scheduleEmailReminder({
        type: 'staff_treatment_reminder',
        scheduleId: schedule._id,
        recipientId: schedule.workerId,
        scheduledFor: schedule.reminders.staff.email.scheduledFor,
        data: {
          workerName: assignment.worker.name,
          patientName: assignment.patient.name,
          treatmentType: schedule.treatmentType,
          scheduledDate: schedule.scheduledDate,
          location: schedule.location
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Treatment schedule created successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Create treatment schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create treatment schedule',
      error: error.message
    });
  }
};

// Update treatment schedule
const updateTreatmentSchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updates = { ...req.body };

    // Add metadata
    updates['metadata.lastModifiedBy'] = req.user.userId;

    const schedule = await TreatmentSchedule.findByIdAndUpdate(
      id,
      updates,
      { 
        new: true, 
        runValidators: true 
      }
    )
      .populate('patient', 'name email department')
      .populate('worker', 'name email department')
      .populate('doctor', 'name email department')
      .populate('assignment', 'priority status notes');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Treatment schedule not found'
      });
    }

    // If date/time changed, reschedule email reminders
    if (updates.scheduledDate) {
      // Cancel old reminders
      await cancelScheduledEmail('patient_treatment_reminder', schedule._id);
      await cancelScheduledEmail('staff_treatment_reminder', schedule._id);

      // Schedule new reminders
      if (schedule.reminders.patient.email.enabled) {
        await scheduleEmailReminder({
          type: 'patient_treatment_reminder',
          scheduleId: schedule._id,
          recipientId: schedule.patientId,
          scheduledFor: schedule.reminders.patient.email.scheduledFor,
          data: {
            patientName: schedule.patient.name,
            treatmentType: schedule.treatmentType,
            scheduledDate: schedule.scheduledDate,
            location: schedule.location
          }
        });
      }

      if (schedule.reminders.staff.email.enabled) {
        await scheduleEmailReminder({
          type: 'staff_treatment_reminder',
          scheduleId: schedule._id,
          recipientId: schedule.workerId,
          scheduledFor: schedule.reminders.staff.email.scheduledFor,
          data: {
            workerName: schedule.worker.name,
            patientName: schedule.patient.name,
            treatmentType: schedule.treatmentType,
            scheduledDate: schedule.scheduledDate,
            location: schedule.location
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Treatment schedule updated successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Update treatment schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update treatment schedule',
      error: error.message
    });
  }
};

// Delete treatment schedule
const deleteTreatmentSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const schedule = await TreatmentSchedule.findByIdAndDelete(id);
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Treatment schedule not found'
      });
    }

    // Cancel scheduled email reminders
    await cancelScheduledEmail('patient_treatment_reminder', schedule._id);
    await cancelScheduledEmail('staff_treatment_reminder', schedule._id);

    res.json({
      success: true,
      message: 'Treatment schedule deleted successfully'
    });
  } catch (error) {
    console.error('Delete treatment schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete treatment schedule',
      error: error.message
    });
  }
};

// Get worker's schedule
const getWorkerSchedule = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { startDate, endDate, status } = req.query;

    // If no workerId provided and user is staff, use their ID
    const targetWorkerId = workerId || (req.user.role === 'staff' ? req.user.userId : null);

    if (!targetWorkerId) {
      return res.status(400).json({
        success: false,
        message: 'Worker ID is required'
      });
    }

    const query = { workerId: targetWorkerId };
    
    if (status) {
      query.status = status;
    }

    // Date range (default to next 30 days)
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    query.scheduledDate = { $gte: start, $lte: end };

    const schedules = await TreatmentSchedule.find(query)
      .populate('patient', 'name email department')
      .populate('assignment', 'priority status notes')
      .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      data: {
        schedules,
        summary: {
          total: schedules.length,
          upcoming: schedules.filter(s => s.status === 'scheduled' && s.scheduledDate > new Date()).length,
          completed: schedules.filter(s => s.status === 'completed').length,
          cancelled: schedules.filter(s => s.status === 'cancelled').length
        }
      }
    });
  } catch (error) {
    console.error('Get worker schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch worker schedule',
      error: error.message
    });
  }
};

// Get patient's appointments
const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.query;

    const query = { patientId };
    if (status) query.status = status;

    const appointments = await TreatmentSchedule.find(query)
      .populate('worker', 'name email department')
      .populate('doctor', 'name email department')
      .populate('assignment', 'priority status notes')
      .sort({ scheduledDate: -1 });

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient appointments',
      error: error.message
    });
  }
};

// Update treatment status
const updateTreatmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, results } = req.body;

    const schedule = await TreatmentSchedule.findByIdAndUpdate(
      id,
      {
        status,
        'results.notes': notes,
        'results.completed': status === 'completed',
        ...results,
        'metadata.lastModifiedBy': req.user.userId
      },
      { new: true }
    )
      .populate('patient', 'name email department')
      .populate('worker', 'name email department');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Treatment schedule not found'
      });
    }

    res.json({
      success: true,
      message: 'Treatment status updated successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Update treatment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update treatment status',
      error: error.message
    });
  }
};

// Get dashboard stats for treatments
const getTreatmentStats = async (req, res) => {
  try {
    const { workerId, department } = req.query;
    
    let matchQuery = {};
    
    // If user is staff, only show their stats
    if (req.user.role === 'staff') {
      matchQuery.workerId = req.user.userId;
    } else if (workerId) {
      matchQuery.workerId = workerId;
    }
    
    if (department) {
      matchQuery['metadata.department'] = department;
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const stats = await TreatmentSchedule.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalScheduled: { $sum: 1 },
          todayScheduled: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$scheduledDate', startOfDay] },
                    { $lte: ['$scheduledDate', endOfDay] }
                  ]
                },
                1,
                0
              ]
            }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          urgent: {
            $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalScheduled: 0,
      todayScheduled: 0,
      completed: 0,
      cancelled: 0,
      urgent: 0
    };

    res.json({
      success: true,
      data: {
        overview: result,
        upcomingCount: result.totalScheduled - result.completed - result.cancelled
      }
    });
  } catch (error) {
    console.error('Get treatment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch treatment statistics',
      error: error.message
    });
  }
};

export {
  getTreatmentSchedules,
  getTreatmentScheduleById,
  createTreatmentSchedule,
  updateTreatmentSchedule,
  deleteTreatmentSchedule,
  getWorkerSchedule,
  getPatientAppointments,
  updateTreatmentStatus,
  getTreatmentStats
};
