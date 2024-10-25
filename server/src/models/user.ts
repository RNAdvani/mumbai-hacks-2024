import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import randomize from 'randomatic'

export interface UserSchemaType {
  _id: mongoose.Types.ObjectId
  username?: string
  email?: string
  phone?: string
  profilePicture?: string
  isOnline?: boolean
  loginVerificationCode?: string
  loginVerificationCodeExpires?: Date
  googleId?: string,
  role: 'owner' | 'manager' | 'employee'
  managedProjects?: mongoose.Types.ObjectId[]
  assignedTasks?: mongoose.Types.ObjectId[]
  department?: string
  skills?: string[]
  getSignedJwtToken?: () => string
  getVerificationCode?: () => string
}

const userSchema = new mongoose.Schema<UserSchemaType>(
  {
    username: {
      type: String,
      default() {
        return this.email.split('@')[0]
      },
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
      match: [/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/, 'Please enter a valid email'],
    },
    role: {
      type: String,
      enum: ['owner', 'manager', 'employee'],
      required: true,
      default: 'employee'
    },
    department: String,
    skills: [String],
    managedProjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }],
    assignedTasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }],
    googleId: String,
    isOnline: Boolean,
    phone: String,
    profilePicture: String,
    loginVerificationCode: String,
    loginVerificationCodeExpires: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}

// Generate login verification code
userSchema.methods.getVerificationCode = function () {
  const verificationCode = randomize('Aa0', 6)

  this.loginVerificationCode = crypto
    .createHash('sha256')
    .update(verificationCode)
    .digest('hex')

  this.loginVerificationCodeExpires = Date.now() + 10 * 60 * 1000 // 10 minutes

  return verificationCode
}

export default mongoose.model('User', userSchema)
