import express from 'express';
import { body, param, query } from 'express-validator';
import * as assignmentController from '../controllers/assignment.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation middleware
const validateAssignmentId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid assignment ID')
];

const validateCreateAssignment = [
  body('patientId')
    .isMongoId()
    .withMessage('Invalid patient ID'),
  
  body('workerId')
    .isMongoId()
    .withMessage('Invalid worker ID'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be a string with maximum 1000 characters'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((endDate, { req }) => {
      if (req.body.startDate && new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

const validateUpdateAssignment = [
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('status')
    .optional()
    .isIn(['active', 'completed', 'cancelled'])
    .withMessage('Status must be one of: active, completed, cancelled'),
  
  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be a string with maximum 1000 characters'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

const validateBulkUpdate = [
  body('assignmentIds')
    .isArray({ min: 1 })
    .withMessage('Assignment IDs must be a non-empty array')
    .custom((ids) => {
      const areAllValidIds = ids.every(id => /^[0-9a-fA-F]{24}$/.test(id));
      if (!areAllValidIds) {
        throw new Error('All assignment IDs must be valid MongoDB ObjectIds');
      }
      return true;
    }),
  
  body('updates')
    .isObject()
    .withMessage('Updates must be an object'),
  
  body('updates.priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('updates.status')
    .optional()
    .isIn(['active', 'completed', 'cancelled'])
    .withMessage('Status must be one of: active, completed, cancelled'),
  
  body('updates.notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be a string with maximum 1000 characters')
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
    .isIn(['active', 'completed', 'cancelled'])
    .withMessage('Status must be one of: active, completed, cancelled'),
  
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  query('department')
    .optional()
    .isString()
    .trim()
    .withMessage('Department must be a string'),
  
  query('workerId')
    .optional()
    .isMongoId()
    .withMessage('Worker ID must be a valid MongoDB ObjectId'),
  
  query('patientId')
    .optional()
    .isMongoId()
    .withMessage('Patient ID must be a valid MongoDB ObjectId'),
  
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
];

const validateUserId = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID')
];

// Admin middleware - ensure user has admin role
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

const requireAdminAndStaff = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or staff role required.'
    });
  }
  next();
};


// Routes

// GET /assignments - Get all assignments with filtering and pagination
router.get('/', 
  verifyToken,
  requireAdminAndStaff,
  validateQueryParams,
  assignmentController.getAssignments
);

// GET /assignments/stats - Get assignment statistics
router.get('/stats',
  verifyToken,
  requireAdmin,
  assignmentController.getAssignmentStats
);

// GET /assignments/worker/:userId - Get assignments for a specific worker
router.get('/worker/:userId',
  verifyToken,
  validateUserId,
  assignmentController.getWorkerAssignments
);

// GET /assignments/patient/:userId - Get assignments for a specific patient
router.get('/patient/:userId',
  verifyToken,
  validateUserId,
  assignmentController.getPatientAssignments
);

// GET /assignments/:id - Get single assignment
router.get('/:id',
  verifyToken,
  validateAssignmentId,
  assignmentController.getAssignment
);

// POST /assignments - Create new assignment
router.post('/',
  verifyToken,
  requireAdmin,
  validateCreateAssignment,
  assignmentController.createAssignment
);

// PUT /assignments/:id - Update assignment
router.put('/:id',
  verifyToken,
  requireAdmin,
  validateAssignmentId,
  validateUpdateAssignment,
  assignmentController.updateAssignment
);

// DELETE /assignments/:id - Delete assignment
router.delete('/:id',
  verifyToken,
  requireAdmin,
  validateAssignmentId,
  assignmentController.deleteAssignment
);

// POST /assignments/bulk-update - Bulk update assignments
router.post('/bulk-update',
  verifyToken,
  requireAdmin,
  validateBulkUpdate,
  assignmentController.bulkUpdateAssignments
);

export default router;
