import mongoose from "mongoose"

interface ProjectSchemaType {
    _id: mongoose.Schema.Types.ObjectId
    name: string
    description: string
    manager: mongoose.Schema.Types.ObjectId
    organisation: mongoose.Schema.Types.ObjectId
    status: 'planning' | 'active' | 'completed' | 'on-hold'
    priority: 'low' | 'medium' | 'high'
    startDate: Date
    endDate: Date
    channel: mongoose.Schema.Types.ObjectId
    tasks: mongoose.Schema.Types.ObjectId[]
    team: mongoose.Schema.Types.ObjectId[]
    budget?: number
    tags: string[]
    attachments: string[]
    progress: number
  }

  const projectSchema = new mongoose.Schema<ProjectSchemaType>(
    {
      name: {
        type: String,
        required: [true, 'Please enter project name'],
      },
      description: {
        type: String,
        required: [true, 'Please provide project description'],
      },
      manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      organisation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organisation',
        required: true,
      },
      status: {
        type: String,
        enum: ['planning', 'active', 'completed', 'on-hold'],
        default: 'planning',
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
      },
      tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      }],
      team: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
      budget: Number,
      tags: [String],
      attachments: [String],
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

  projectSchema.pre('save', async function(next) {
    if (this.isNew) {
      const channel = await mongoose.model('Channel').create({
        name: `project-${this.name.toLowerCase().replace(/\s+/g, '-')}`,
        collaborators: [this.manager, ...this.team],
        title: `Project Channel: ${this.name}`,
        description: this.description,
        organisation: this.organisation,
        isChannel: true,
      })
      this.channel = channel._id
    }
    next()
  })

  export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema)
