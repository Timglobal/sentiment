import express from 'express';
import { body, param, query } from 'express-validator';
import * as treatmentController from '../controllers/treatmentSchedule.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation middleware
const validateTreatmentId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid treatment schedule ID')
];

const validateCreateTreatment = [
  body('assignmentId')
    .isMongoId()
    .withMessage('Invalid assignment ID'),
  
  body('treatmentType')
    .isIn(['consultation', 'procedure', 'surgery', 'therapy', 'checkup', 'lab_work', 'imaging', 'emergency'])
    .withMessage('Invalid treatment type'),
  
  body('title')
    .notEmpty()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .notEmpty()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('scheduledDate')
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date')
    .custom((date) => {
      const scheduleDate = new Date(date);
      const now = new Date();
      if (scheduleDate <= now) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),
  
  body('estimatedDuration')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, normal, high, urgent'),
  
  body('assignedDoctor')
    .optional()
    .isMongoId()
    .withMessage('Invalid doctor ID'),
  
  body('location.room')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Room must be less than 50 characters'),
  
  body('preparation.instructions')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Preparation instructions must be less than 1000 characters')
];

const validateUpdateTreatment = [
  body('treatmentType')
    .optional()
    .isIn(['consultation', 'procedure', 'surgery', 'therapy', 'checkup', 'lab_work', 'imaging', 'emergency'])
    .withMessage('Invalid treatment type'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date'),
  
  body('estimatedDuration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, normal, high, urgent'),
  
  body('status')
    .optional()
    .isIn(['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'])
    .withMessage('Status must be one of: scheduled, in_progress, completed, cancelled, rescheduled')
];

const validateStatusUpdate = [
  body('status')
    .isIn(['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'])
    .withMessage('Status must be one of: scheduled, in_progress, completed, cancelled, rescheduled'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'])
    .withMessage('Invalid status filter'),
  
  query('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority filter'),
  
  query('treatmentType')
    .optional()
    .isIn(['consultation', 'procedure', 'surgery', 'therapy', 'checkup', 'lab_work', 'imaging', 'emergency'])
    .withMessage('Invalid treatment type filter'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
];

// Routes

// Get all treatment schedules (with filtering and pagination)
// GET /api/treatments?page=1&limit=10&status=scheduled&workerId=123
router.get('/', 
  verifyToken, 
  validateQueryParams,
  treatmentController.getTreatmentSchedules
);

// Get treatment schedule by ID
// GET /api/treatments/:id
router.get('/:id', 
  verifyToken, 
  validateTreatmentId,
  treatmentController.getTreatmentScheduleById
);

// Create new treatment schedule
// POST /api/treatments
router.post('/', 
  verifyToken, 
  validateCreateTreatment,
  treatmentController.createTreatmentSchedule
);

// Update treatment schedule
// PUT /api/treatments/:id
router.put('/:id', 
  verifyToken, 
  validateTreatmentId,
  validateUpdateTreatment,
  treatmentController.updateTreatmentSchedule
);

// Delete treatment schedule
// DELETE /api/treatments/:id
router.delete('/:id', 
  verifyToken, 
  validateTreatmentId,
  treatmentController.deleteTreatmentSchedule
);

// Get worker's schedule
// GET /api/treatments/worker/:workerId?startDate=2024-01-01&endDate=2024-01-31
// GET /api/treatments/worker/me (for current user if staff)
router.get('/worker/:workerId', 
  verifyToken,
  param('workerId').custom((value) => {
    if (value !== 'me' && !value.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid worker ID');
    }
    return true;
  }),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled']),
  treatmentController.getWorkerSchedule
);

// Get patient's appointments
// GET /api/treatments/patient/:patientId
router.get('/patient/:patientId', 
  verifyToken,
  param('patientId').isMongoId().withMessage('Invalid patient ID'),
  query('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled']),
  treatmentController.getPatientAppointments
);

// Update treatment status (quick status update with notes)
// PATCH /api/treatments/:id/status
router.patch('/:id/status', 
  verifyToken, 
  validateTreatmentId,
  validateStatusUpdate,
  treatmentController.updateTreatmentStatus
);

// Get treatment statistics
// GET /api/treatments/stats?workerId=123&department=cardiology
router.get('/stats/overview', 
  verifyToken,
  query('workerId').optional().isMongoId().withMessage('Invalid worker ID'),
  query('department').optional().trim().isLength({ min: 2, max: 50 }),
  treatmentController.getTreatmentStats
);

// Bulk operations

// Get today's schedule for a worker
// GET /api/treatments/today/:workerId
router.get('/today/:workerId', 
  verifyToken,
  param('workerId').custom((value) => {
    if (value !== 'me' && !value.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid worker ID');
    }
    return true;
  }),
  async (req, res, next) => {
    // Set date range to today
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    req.query.startDate = startOfDay.toISOString();
    req.query.endDate = endOfDay.toISOString();
    req.query.status = 'scheduled,in_progress';
    
    next();
  },
  treatmentController.getWorkerSchedule
);

// Get upcoming treatments for a worker (next 7 days)
// GET /api/treatments/upcoming/:workerId
router.get('/upcoming/:workerId', 
  verifyToken,
  param('workerId').custom((value) => {
    if (value !== 'me' && !value.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid worker ID');
    }
    return true;
  }),
  async (req, res, next) => {
    // Set date range to next 7 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    req.query.startDate = startDate.toISOString();
    req.query.endDate = endDate.toISOString();
    req.query.status = 'scheduled';
    
    next();
  },
  treatmentController.getWorkerSchedule
);

export default router;
