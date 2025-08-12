import express from 'express'
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  bulkUpdateTasks,
  getTasksByCategory,
  getOverdueTasks,
  addTaskNote,
  archiveTask
} from '../controllers/task.controller.js'
import { verifyToken, requireStaff } from '../middleware/auth.middleware.js'

const router = express.Router()

// All task routes require authentication and staff role
router.use(verifyToken)
router.use(requireStaff)

// Get all tasks with filtering, pagination, and search
router.get('/', getTasks)

// Get tasks grouped by category
router.get('/by-category', getTasksByCategory)

// Get overdue tasks
router.get('/overdue', getOverdueTasks)

// Get single task by ID
router.get('/:id', getTaskById)

// Create new task
router.post('/', createTask)

// Update task
router.put('/:id', updateTask)

// Delete task
router.delete('/:id', deleteTask)

// Bulk update multiple tasks
router.patch('/bulk', bulkUpdateTasks)

// Add note to task
router.post('/:id/notes', addTaskNote)

// Archive task
router.patch('/:id/archive', archiveTask)

export default router
