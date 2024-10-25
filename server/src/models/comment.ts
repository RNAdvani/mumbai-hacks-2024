import mongoose from 'mongoose'

interface CommentSchemaType {
  user: mongoose.Types.ObjectId
  task: mongoose.Types.ObjectId
  content: string
  attachments?: string[]
  mentions?: mongoose.Types.ObjectId[]
  parentComment?: mongoose.Types.ObjectId
  reactions?: {
    user: mongoose.Types.ObjectId
    type: 'like' | 'heart' | 'smile' | 'thumbsup'
  }[]
  isEdited?: boolean
  editHistory?: {
    content: string
    editedAt: Date
  }[]
    createdAt: Date
    updatedAt: Date
}

const commentSchema = new mongoose.Schema<CommentSchemaType>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
    },
    attachments: [String],
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      type: {
        type: String,
        enum: ['like', 'heart', 'smile', 'thumbsup'],
      },
    }],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editHistory: [{
      content: String,
      editedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Middleware to update task when comment is added
commentSchema.post('save', async function() {
  const task = await mongoose.model('Task').findById(this.task)
  if (task) {
    task.comments.push({
      user: this.user,
      content: this.content,
      createdAt: this.createdAt,
    })
    await task.save()
  }
})

export const Comment = mongoose.model('Comment', commentSchema)