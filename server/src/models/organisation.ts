import mongoose from 'mongoose'
import { UserSchemaType } from './user'

export interface OrganisationSchemaType {
  owner: mongoose.Schema.Types.ObjectId
  name: string
  hobbies: string[]
  coWorkers: mongoose.Schema.Types.ObjectId[] & UserSchemaType[]
  generateJoinLink: () => string
  joinLink: string
  url: string,
  departments: string[]
  managers: mongoose.Schema.Types.ObjectId[]
  projects: mongoose.Schema.Types.ObjectId[]
  settings: {
    allowEmployeeTaskCreation: boolean
    defaultTaskChannel: boolean
    notificationPreferences: {
      taskAssignment: boolean
      taskStatusChange: boolean
      projectUpdates: boolean
    }
  }
}

const organisationSchema = new mongoose.Schema<OrganisationSchemaType>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
    },
    coWorkers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    departments: [String],
    managers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    }],
    settings: {
      allowEmployeeTaskCreation: {
        type: Boolean,
        default: true,
      },
      defaultTaskChannel: {
        type: Boolean,
        default: true,
      },
      notificationPreferences: {
        taskAssignment: {
          type: Boolean,
          default: true,
        },
        taskStatusChange: {
          type: Boolean,
          default: true,
        },
        projectUpdates: {
          type: Boolean,
          default: true,
        },
      },
    },
    joinLink: String,
    url: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Generate orgnaisation join link
organisationSchema.methods.generateJoinLink = function () {
  const url =
    process.env.NODE_ENV === 'development'
      ? process.env.STAGING_URL
      : process.env.PRODUCTION_URL
  this.joinLink = `${url}/${this._id}`
  this.url = `${url}/${this.name}`
}

export default mongoose.model('Organisation', organisationSchema)
