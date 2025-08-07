import Assignment from '../models/Assignment.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

// Get all assignments with filtering and pagination
const getAssignments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      department, 
      workerId, 
      patientId,
      search 
    } = req.query;

    const query = {};
    
    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (department) query.department = department;
    if (workerId) query.workerId = workerId;
    if (patientId) query.patientId = patientId;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: [
        { path: 'patient', select: 'name email department' },
        { path: 'worker', select: 'name email department role' },
        { path: 'assignedByUser', select: 'name email' }
      ]
    };

    let assignments;
    
    if (search) {
      // If search query exists, perform text search
      const searchRegex = new RegExp(search, 'i');
      const patients = await User.find({ 
        role: 'patient', 
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      
      const workers = await User.find({ 
        role: 'staff', 
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');

      query.$or = [
        { patientId: { $in: patients.map(p => p._id) } },
        { workerId: { $in: workers.map(w => w._id) } },
        { department: searchRegex },
        { notes: searchRegex }
      ];
    }

    assignments = await Assignment.paginate(query, options);

    res.json({
      success: true,
      data: {
        assignments: assignments.docs,
        totalAssignments: assignments.totalDocs,
        totalPages: assignments.totalPages,
        currentPage: assignments.page,
        hasNextPage: assignments.hasNextPage,
        hasPrevPage: assignments.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
      error: error.message
    });
  }
};

// Get assignment statistics
const getAssignmentStats = async (req, res) => {
  try {
    const overviewStats = await Assignment.getAssignmentStats();
    const departmentStats = await Assignment.getDepartmentStats();

    // Get user counts
    const [totalPatients, totalWorkers] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'staff' })
    ]);

    res.json({
      success: true,
      data: {
        overview: overviewStats,
        departmentStats,
        totalPatients,
        totalWorkers
      }
    });
  } catch (error) {
    console.error('Error fetching assignment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment statistics',
      error: error.message
    });
  }
};

// Get single assignment
const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('patient', 'name email department')
      .populate('worker', 'name email department role')
      .populate('assignedByUser', 'name email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment',
      error: error.message
    });
  }
};

// Create new assignment
const createAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      patientId,
      workerId,
      priority = 'medium',
      notes,
      startDate,
      endDate,
      metadata
    } = req.body;

    // Verify patient exists and has correct role
    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID or user is not a patient'
      });
    }

    // Verify worker exists and has correct role
    const worker = await User.findOne({ _id: workerId, role: 'staff' });
    if (!worker) {
      return res.status(400).json({
        success: false,
        message: 'Invalid worker ID or user is not a staff member'
      });
    }

    // Check if departments match
    // if (patient.department !== worker.department) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Patient and worker must be in the same department'
    //   });
    // }

    // Check for existing active assignment
    const existingAssignment = await Assignment.findOne({
      patientId,
      workerId,
      status: 'active'
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'An active assignment already exists between this patient and worker'
      });
    }

    const assignment = new Assignment({
      patientId,
      workerId,
      assignedBy: req.user.id,
      department: patient.department,
      priority,
      notes,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      metadata
    });

    await assignment.save();
    
    // Populate the assignment before sending response
    await assignment.populate([
      { path: 'patient', select: 'name email department' },
      { path: 'worker', select: 'name email department role' },
      { path: 'assignedByUser', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating assignment',
      error: error.message
    });
  }
};

// Update assignment
const updateAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const allowedUpdates = ['priority', 'status', 'notes', 'endDate', 'metadata'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // If status is being changed to completed, set endDate if not provided
    if (updates.status === 'completed' && !updates.endDate) {
      updates.endDate = new Date();
    }

    Object.assign(assignment, updates);
    await assignment.save();

    await assignment.populate([
      { path: 'patient', select: 'name email department' },
      { path: 'worker', select: 'name email department role' },
      { path: 'assignedByUser', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating assignment',
      error: error.message
    });
  }
};

// Delete assignment
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting assignment',
      error: error.message
    });
  }
};

// Bulk operations
const bulkUpdateAssignments = async (req, res) => {
  try {
    const { assignmentIds, updates } = req.body;

    if (!assignmentIds || !Array.isArray(assignmentIds) || assignmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Assignment IDs array is required'
      });
    }

    const allowedUpdates = ['priority', 'status', 'notes'];
    const filteredUpdates = {};
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    const result = await Assignment.updateMany(
      { _id: { $in: assignmentIds } },
      filteredUpdates
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} assignments updated successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error bulk updating assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk updating assignments',
      error: error.message
    });
  }
};

// Get assignments by worker
const getWorkerAssignments = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { status = 'active' } = req.query;

    const assignments = await Assignment.getAssignmentsByWorker(workerId);

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching worker assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching worker assignments',
      error: error.message
    });
  }
};

// Get assignments by patient
const getPatientAssignments = async (req, res) => {
  try {
    const { patientId } = req.params;

    const assignments = await Assignment.getAssignmentsByPatient(patientId);

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching patient assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient assignments',
      error: error.message
    });
  }
};

export {
  getAssignments,
  getAssignmentStats,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  bulkUpdateAssignments,
  getWorkerAssignments,
  getPatientAssignments
};
