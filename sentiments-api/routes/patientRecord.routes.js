import express from 'express';
import { body, param } from 'express-validator';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  getPatientMedicalHistory,
  updatePatientRecord,
  addMedicalNote,
  getAssignmentStats
} from '../controllers/patientRecord.controller.js';

const router = express.Router();

// Get patient medical history
router.get('/:patientId/medical-history', verifyToken, getPatientMedicalHistory);

// Update patient record (for staff)
router.put(
  '/:patientId/update-record',
  verifyToken,
  [
    param('patientId').isMongoId().withMessage('Valid patient ID required'),
    body('medicalNotes.type')
      .optional()
      .isIn(['examination', 'diagnosis', 'treatment', 'medication', 'observation', 'procedure', 'consultation', 'lab_result', 'other'])
      .withMessage('Invalid medical note type'),
    body('medicalNotes.title')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Medical note title must be between 1 and 200 characters'),
    body('medicalNotes.content')
      .optional()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Medical note content must be between 1 and 2000 characters'),
    body('treatmentPlan.medications')
      .optional()
      .isArray()
      .withMessage('Medications must be an array'),
    body('treatmentPlan.instructions')
      .optional()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Instructions must be between 1 and 1000 characters')
  ],
  updatePatientRecord
);

// Add medical note to patient record
router.post(
  '/:patientId/medical-notes',
  verifyToken,
  [
    param('patientId').isMongoId().withMessage('Valid patient ID required'),
    body('type')
      .trim()
      .isIn(['examination', 'diagnosis', 'treatment', 'medication', 'observation', 'procedure', 'consultation', 'lab_result', 'other'])
      .withMessage('Valid note type is required'),
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('content')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Content must be between 1 and 2000 characters')
  ],
  addMedicalNote
);

// Get assignment statistics for a staff member
router.get(
  '/staff/:staffId/stats',
  verifyToken,
  [
    param('staffId').isMongoId().withMessage('Valid staff ID required')
  ],
  getAssignmentStats
);

export default router;
