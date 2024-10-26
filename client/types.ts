import mongoose from 'mongoose'

export type Project = {
  _id: mongoose.Schema.Types.ObjectId
  name: string
  description: string
  manager: User
  organisation: mongoose.Schema.Types.ObjectId
  status: 'planning' | 'active' | 'completed' | 'on-hold'
  priority: 'low' | 'medium' | 'high'
  startDate: Date
  endDate: Date
  channel: mongoose.Schema.Types.ObjectId
  tasks: Task[]
  team: User[]
  budget?: number
  tags: string[]
  attachments: string[]
  progress: number
}

export type User = {
  _id: mongoose.Types.ObjectId
  username?: string
  email?: string
  phone?: string
  profilePicture?: string
  isOnline?: boolean
  loginVerificationCode?: string
  loginVerificationCodeExpires?: Date
  googleId?: string
  avatar?: string
  role: 'owner' | 'manager' | 'employee'
  managedProjects?: Project[]
  assignedTasks?: Task[]
  department?: string
  skills?: string[]
  getSignedJwtToken?: () => string
  getVerificationCode?: () => string
}

export type Task = {
  title: string
  description: string
  project: Project
  assignedTo: User[]
  assignedBy: User
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
    user: User
    content: string
    createdAt: Date
  }[]
  tags: string[]
  progress: number
}

export type Comment = {
  user: User
  task: Task
  content: string
  attachments?: string[]
  mentions?: User[]
  parentComment?: Comment
  reactions?: {
    user: User
    type: 'like' | 'heart' | 'smile' | 'thumbsup'
  }[]
  isEdited?: boolean
  editHistory?: {
    content: string
    editedAt: Date
  }[]
}

export type Channel = {
  name: string
  collaborators: User[]
  title: string
  description: string
  organisation: Organisation
  hasNotOpen: User[]
  isChannel: boolean
  createdAt: Date
  updatedAt: Date
}

export type Organisation = {
  owner: User
  name: string
  hobbies: string[]
  coWorkers: User[]
  generateJoinLink: () => string
  joinLink: string
  url: string
  departments: string[]
  managers: User[]
  projects: Project[]
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

export type Meeting = {
  _id: string
  title: string
  description: string
  organizer: string
  organisation: string
  participants: Array<{
    user: string
    joinedAt?: Date
    leftAt?: Date
  }>
  scheduledStartTime: Date
  scheduledEndTime: Date
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  recording?: {
    url?: string
    startedAt?: Date
    endedAt?: Date
  }
}
