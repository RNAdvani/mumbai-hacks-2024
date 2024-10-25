import mongoose from "mongoose"

interface TaskSchemaType {
    title: string
    description: string
    project: mongoose.Schema.Types.ObjectId
    assignedTo: mongoose.Schema.Types.ObjectId[]
    assignedBy: mongoose.Schema.Types.ObjectId
    status: 'todo' | 'in-progress' | 'review' | 'completed'
    priority: 'low' | 'medium' | 'high'
    dueDate: Date
    startDate: Date
    estimatedHours: number
    actualHours: number
    dependencies: mongoose.Schema.Types.ObjectId[]
    subtasks: {
      title: string
      completed: boolean
    }[]
    attachments: string[]
    comments: {
      user: mongoose.Schema.Types.ObjectId
      content: string
      createdAt: Date
    }[]
    tags: string[]
    progress: number
  }

  const taskSchema = new mongoose.Schema<TaskSchemaType>(
    {
      title: {
        type: String,
        required: [true, 'Please enter task title'],
      },
      description: {
        type: String,
        required: [true, 'Please provide task description'],
      },
      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
      },
      assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
      assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      status: {
        type: String,
        enum: ['todo', 'in-progress', 'review', 'completed'],
        default: 'todo',
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      dueDate: {
        type: Date,
        required: true,
      },
      startDate: Date,
      estimatedHours: Number,
      actualHours: {
        type: Number,
        default: 0,
      },
      dependencies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      }],
      subtasks: [{
        title: String,
        completed: {
          type: Boolean,
          default: false,
        },
      }],
      attachments: [String],
      comments: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }],
      tags: [String],
      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  )

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema)
  