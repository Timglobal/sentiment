import Task from '../models/Task.js'
import User from '../models/User.js'
import mongoose from 'mongoose'
import { scheduleTaskReminders, cancelTaskReminders } from '../utils/taskScheduler.js'

// Get all tasks for the authenticated user
export const getTasks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      category, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = req.query

    const userId = req.user.id
    // console.log('Fetching tasks for user ID:', userId)
    // console.log('User object:', req.user)
    // console.log('UserId type:', typeof userId)
    const skip = (page - 1) * limit

    // Build query - ensure userId is in the correct format for MongoDB
    const query = { 
      userId: userId,
      isArchived: false 
    }


    // Add filters
    if (status) query.status = status
    if (priority) query.priority = priority
    if (category) query.category = new RegExp(category, 'i')
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.dueDate = {}
      if (dateFrom) query.dueDate.$gte = new Date(dateFrom)
      if (dateTo) query.dueDate.$lte = new Date(dateTo)
    }

    // Sort configuration
    const sortConfig = {}
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1
    // console.log('Task query:', query)
    // Execute queries
    // console.log({
    //   sortConfig,
    //   skip,
    //   limit: parseInt(limit)
    // })

    const getTheTasks = await Task.find();
    //console.log({ getTheTasks })
    const [tasks, totalTasks] = await Promise.all([
      await Task.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(query)
    ])
    
    // console.log('Found tasks:', tasks.length)
    // console.log('Total tasks count:', totalTasks)
    // console.log('Tasks data:', tasks)

    // Calculate stats
    const stats = await Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), isArchived: false } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          pendingTasks: {
            $sum: {
              $cond: [
                { $in: ['$status', ['pending', 'in-progress']] },
                1,
                0
              ]
            }
          },
          completedTasks: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$status', 'overdue'] },
                    {
                      $and: [
                        { $lt: ['$dueDate', new Date()] },
                        { $ne: ['$status', 'completed'] }
                      ]
                    }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ])

    res.json({
      success: true,
      data: tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTasks / limit),
        totalTasks,
        hasNext: page * limit < totalTasks,
        hasPrev: page > 1
      },
      stats: stats[0] || {
        totalTasks: 0,
        pendingTasks: 0,
        completedTasks: 0,
        overdueTasks: 0
      }
    })
  } catch (error) {
    // console.error('Error fetching tasks:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    })
  }
}

// Get single task by ID
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const task = await Task.findOne({ _id: id, userId: new mongoose.Types.ObjectId(userId) })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    res.json({
      success: true,
      data: task
    })
  } catch (error) {
    // console.error('Error fetching task:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message
    })
  }
}

// Create new task
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority = 'medium',
      category,
      dueDate,
      estimatedHours,
      tags = [],
      assignedTo
    } = req.body

    const userId = req.user.id

    // Validation
    if (!title || !description || !category || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and due date are required'
      })
    }

    // Validate due date
    if (new Date(dueDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Due date cannot be in the past'
      })
    }

    // Validate assigned user if provided
    if (assignedTo && assignedTo !== userId) {
      const assignedUser = await User.findById(assignedTo)
      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user not found'
        })
      }
    }

    const task = new Task({
      title,
      description,
      priority,
      category,
      dueDate: new Date(dueDate),
      estimatedHours,
      tags,
      userId: new mongoose.Types.ObjectId(userId),
      assignedTo: new mongoose.Types.ObjectId(assignedTo || userId),
      company: req.user.company
    })

    const savedTask = await task.save()
    await savedTask.populate('userId', 'name email role')
    await savedTask.populate('assignedTo', 'name email role')

    // Schedule email reminders for the new task
    try {
      await scheduleTaskReminders(savedTask._id)
      console.log(`📅 Email reminders scheduled for task: ${savedTask.title}`)
    } catch (scheduleError) {
      console.error('Failed to schedule task reminders:', scheduleError)
      // Don't fail the task creation if scheduling fails
    }

    res.status(201).json({
      success: true,
      data: savedTask,
      message: 'Task created successfully'
    })
  } catch (error) {
    // console.error('Error creating task:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    })
  }
}

// Update task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const updates = req.body

    // Remove fields that shouldn't be updated directly
    delete updates._id
    delete updates.userId
    delete updates.createdAt
    delete updates.updatedAt

    // Validate due date if provided
    if (updates.dueDate && new Date(updates.dueDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Due date cannot be in the past'
      })
    }

    // Handle status change to completed
    if (updates.status === 'completed') {
      updates.completedAt = new Date()
    } else if (updates.status !== 'completed') {
      updates.completedAt = null
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: new mongoose.Types.ObjectId(userId) },
      updates,
      { new: true, runValidators: true }
    )

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    // If the task status is completed, cancel any pending reminders
    if (updates.status === 'completed') {
      try {
        await cancelTaskReminders(task._id)
        console.log(`✅ Cancelled reminders for completed task: ${task.title}`)
      } catch (cancelError) {
        console.error('Failed to cancel task reminders:', cancelError)
      }
    } 
    // If due date was updated and task is not completed, reschedule reminders
    else if (updates.dueDate) {
      try {
        await cancelTaskReminders(task._id)
        await scheduleTaskReminders(task._id)
        console.log(`🔄 Rescheduled reminders for updated task: ${task.title}`)
      } catch (rescheduleError) {
        console.error('Failed to reschedule task reminders:', rescheduleError)
      }
    }

    res.json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    })
  } catch (error) {
    console.error('Error updating task:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    })
  }
}

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const task = await Task.findOneAndDelete({ _id: id, userId: new mongoose.Types.ObjectId(userId) })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    // Cancel any scheduled reminders for the deleted task
    try {
      await cancelTaskReminders(task._id)
      console.log(`🗑️ Cancelled reminders for deleted task: ${task.title}`)
    } catch (cancelError) {
      console.error('Failed to cancel reminders for deleted task:', cancelError)
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    // console.error('Error deleting task:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    })
  }
}

// Bulk update tasks
export const bulkUpdateTasks = async (req, res) => {
  try {
    const { taskIds, updates } = req.body
    const userId = req.user.id

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task IDs array is required'
      })
    }

    // Remove fields that shouldn't be updated
    delete updates._id
    delete updates.userId
    delete updates.createdAt

    const result = await Task.updateMany(
      { _id: { $in: taskIds }, userId },
      updates,
      { runValidators: true }
    )

    res.json({
      success: true,
      message: `${result.modifiedCount} tasks updated successfully`,
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    // console.error('Error bulk updating tasks:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update tasks',
      error: error.message
    })
  }
}

// Get tasks by category
export const getTasksByCategory = async (req, res) => {
  try {
    const userId = req.user.id

    const tasksByCategory = await Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), isArchived: false } },
      {
        $group: {
          _id: '$category',
          tasks: { $push: '$$ROOT' },
          count: { $sum: 1 },
          pendingCount: {
            $sum: {
              $cond: [
                { $in: ['$status', ['pending', 'in-progress']] },
                1,
                0
              ]
            }
          },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const result = {}
    tasksByCategory.forEach(category => {
      result[category._id] = {
        tasks: category.tasks,
        stats: {
          total: category.count,
          pending: category.pendingCount,
          completed: category.completedCount
        }
      }
    })

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    // console.error('Error fetching tasks by category:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks by category',
      error: error.message
    })
  }
}

// Get overdue tasks
export const getOverdueTasks = async (req, res) => {
  try {
    const userId = req.user.id

    const overdueTasks = await Task.find({
      userId,
      isArchived: false,
      $or: [
        { status: 'overdue' },
        {
          dueDate: { $lt: new Date() },
          status: { $nin: ['completed', 'overdue'] }
        }
      ]
    }).sort({ dueDate: 1 })

    res.json({
      success: true,
      data: overdueTasks
    })
  } catch (error) {
    // console.error('Error fetching overdue tasks:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue tasks',
      error: error.message
    })
  }
}

// Add note to task
export const addTaskNote = async (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body
    const userId = req.user.id

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      })
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      {
        $push: {
          notes: {
            content,
            createdBy: userId,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    )

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    res.json({
      success: true,
      data: task,
      message: 'Note added successfully'
    })
  } catch (error) {
    // console.error('Error adding task note:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message
    })
  }
}

// Archive task
export const archiveTask = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      { isArchived: true },
      { new: true }
    )

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    res.json({
      success: true,
      message: 'Task archived successfully'
    })
  } catch (error) {
    // console.error('Error archiving task:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to archive task',
      error: error.message
    })
  }
}
