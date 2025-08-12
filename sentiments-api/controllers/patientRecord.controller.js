import User from '../models/User.js';
import Assignment from '../models/Assignment.js';
import TreatmentSchedule from '../models/TreatmentSchedule.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';

// Get patient's medical history (notes from assignments and treatments)
const getPatientMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get medical history from various sources
    const [assignments, treatments] = await Promise.all([
      // Get assignments with notes
      Assignment.find({ 
        patientId,
        $or: [
          { notes: { $exists: true, $ne: '' } },
          { 'medicalNotes.0': { $exists: true } }
        ]
      })
      .populate('workerId', 'name role department')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 }),

      // Get treatment schedules with notes
      TreatmentSchedule.find({
        patientId,
        $or: [
          { notes: { $exists: true, $ne: '' } },
          { 'outcome.notes': { $exists: true, $ne: '' } }
        ]
      })
      .populate('workerId', 'name role department')
      .populate('doctor', 'name')
      .sort({ scheduledDate: -1 })
    ]);

    // Combine and format medical history
    const medicalHistory = [];

    // Add assignment notes
    assignments.forEach(assignment => {
      if (assignment.notes) {
        medicalHistory.push({
          id: assignment._id,
          date: assignment.createdAt,
          type: 'assignment',
          title: `Assignment Note - ${assignment.department}`,
          content: assignment.notes,
          provider: assignment.workerId?.name || 'Unknown',
          providerRole: assignment.workerId?.role || 'staff',
          department: assignment.department,
          priority: assignment.priority,
          status: assignment.status
        });
      }

      // Add medical notes array from assignments
      if (assignment.medicalNotes && assignment.medicalNotes.length > 0) {
        assignment.medicalNotes.forEach(note => {
          medicalHistory.push({
            id: `${assignment._id}_${note._id}`,
            date: note.createdAt || assignment.createdAt,
            type: note.type || 'medical_note',
            title: note.title || 'Medical Note',
            content: note.content || note.notes,
            provider: assignment.workerId?.name || 'Unknown',
            providerRole: assignment.workerId?.role || 'staff',
            department: assignment.department,
            assignmentId: assignment._id
          });
        });
      }
    });

    // Add treatment notes
    treatments.forEach(treatment => {
      if (treatment.notes) {
        medicalHistory.push({
          id: treatment._id,
          date: treatment.scheduledDate,
          type: 'treatment',
          title: `${treatment.treatmentType} - ${treatment.title}`,
          content: treatment.notes,
          provider: treatment.doctor?.name || treatment.workerId?.name || 'Unknown',
          providerRole: treatment.doctor ? 'doctor' : 'staff',
          department: treatment.metadata?.department || 'Unknown',
          treatmentType: treatment.treatmentType,
          status: treatment.status
        });
      }

      // Add outcome notes
      if (treatment.outcome && treatment.outcome.notes) {
        medicalHistory.push({
          id: `${treatment._id}_outcome`,
          date: treatment.outcome.completedAt || treatment.scheduledDate,
          type: 'treatment_outcome',
          title: `Treatment Outcome - ${treatment.title}`,
          content: treatment.outcome.notes,
          provider: treatment.doctor?.name || treatment.workerId?.name || 'Unknown',
          providerRole: treatment.doctor ? 'doctor' : 'staff',
          department: treatment.metadata?.department || 'Unknown',
          treatmentType: treatment.treatmentType,
          followUpRequired: treatment.outcome.followUpRequired,
          complications: treatment.outcome.complications
        });
      }
    });

    // Sort by date (most recent first)
    medicalHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedHistory = medicalHistory.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedHistory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: medicalHistory.length,
        pages: Math.ceil(medicalHistory.length / limit),
        hasNext: endIndex < medicalHistory.length,
        hasPrev: startIndex > 0
      }
    });

  } catch (error) {
    console.error('Get patient medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient medical history',
      error: error.message
    });
  }
};

// Update patient record (for staff to add notes and update treatment plans)
const updatePatientRecord = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { medicalNotes, treatmentPlan, status } = req.body;
    const staffId = req.user.userId;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Verify patient exists and staff has assignment
    const [patient, assignment] = await Promise.all([
      User.findById(patientId),
      Assignment.findOne({ 
        patientId, 
        workerId: staffId, 
        status: 'active' 
      })
    ]);

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this patient'
      });
    }

    const updates = {};

    // Add medical note if provided
    if (medicalNotes) {
      const medicalNote = {
        type: medicalNotes.type || 'consultation',
        title: medicalNotes.title,
        content: medicalNotes.content,
        createdBy: staffId,
        createdAt: new Date()
      };

      updates.$push = { medicalNotes: medicalNote };
    }

    // Update treatment plan if provided
    if (treatmentPlan) {
      updates.treatmentPlan = treatmentPlan;
    }

    // Update status if provided
    if (status) {
      updates.status = status;
    }

    // Update assignment
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignment._id,
      { 
        ...updates,
        updatedBy: staffId,
        lastModified: new Date()
      },
      { new: true }
    ).populate('patientId', 'name email');

    res.json({
      success: true,
      message: 'Patient record updated successfully',
      data: updatedAssignment
    });

  } catch (error) {
    console.error('Update patient record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update patient record',
      error: error.message
    });
  }
};

// Add medical note to patient
const addMedicalNote = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { type, title, content, treatmentScheduleId } = req.body;
    const staffId = req.user.userId;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Verify staff has assignment to patient
    const assignment = await Assignment.findOne({ 
      patientId, 
      workerId: staffId, 
      status: 'active' 
    });

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this patient'
      });
    }

    // Create medical note
    const medicalNote = {
      _id: new mongoose.Types.ObjectId(),
      type,
      title,
      content,
      createdBy: staffId,
      createdAt: new Date(),
      treatmentScheduleId: treatmentScheduleId || null
    };

    // Add note to assignment
    await Assignment.findByIdAndUpdate(
      assignment._id,
      { 
        $push: { medicalNotes: medicalNote },
        updatedBy: staffId,
        lastModified: new Date()
      }
    );

    // Also add to treatment schedule if provided
    if (treatmentScheduleId) {
      await TreatmentSchedule.findByIdAndUpdate(
        treatmentScheduleId,
        { 
          $push: { 
            'metadata.medicalNotes': {
              ...medicalNote,
              addedAt: new Date()
            }
          },
          updatedBy: staffId
        }
      );
    }

    res.json({
      success: true,
      message: 'Medical note added successfully',
      data: medicalNote
    });

  } catch (error) {
    console.error('Add medical note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add medical note',
      error: error.message
    });
  }
};

// Get assignment statistics for staff
const getAssignmentStats = async (req, res) => {
  try {
    const { workerId } = req.query;
    const staffId = workerId || req.user.userId;

    // Get assignments statistics
    const stats = await Assignment.aggregate([
      { $match: { workerId: new mongoose.Types.ObjectId(staffId) } },
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
          highPriorityAssignments: {
            $sum: { $cond: [{ $in: ['$priority', ['high', 'urgent']] }, 1, 0] }
          }
        }
      }
    ]);

    // Get upcoming treatments
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingTreatments = await TreatmentSchedule.countDocuments({
      workerId: staffId,
      scheduledDate: { $gte: today, $lte: nextWeek },
      status: 'scheduled'
    });

    const baseStats = stats[0] || {
      totalAssignments: 0,
      activeAssignments: 0,
      completedAssignments: 0,
      highPriorityAssignments: 0
    };

    res.json({
      success: true,
      data: {
        ...baseStats,
        upcomingTreatments,
        totalPatients: baseStats.totalAssignments, // Assuming one patient per assignment
        pendingTreatments: upcomingTreatments
      }
    });

  } catch (error) {
    console.error('Get assignment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment statistics',
      error: error.message
    });
  }
};

export {
  getPatientMedicalHistory,
  updatePatientRecord,
  addMedicalNote,
  getAssignmentStats
};
