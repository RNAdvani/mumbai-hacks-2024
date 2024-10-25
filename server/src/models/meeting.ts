import mongoose from 'mongoose'

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide meeting title'],
    },
    description: String,
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true,
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        joinedAt: Date,
        leftAt: Date,
      },
    ],
    scheduledStartTime: {
      type: Date,
      required: true,
    },
    scheduledEndTime: {
      type: Date,
      required: true,
    },
    actualStartTime: Date,
    actualEndTime: Date,
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    recording: {
      url: String,
      startedAt: Date,
      endedAt: Date,
    },
    meetingMinutes: {
      text: String,
      generatedAt: Date,
    },
    zegoToken: String,
    roomId: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export default mongoose.model('Meeting', meetingSchema)
