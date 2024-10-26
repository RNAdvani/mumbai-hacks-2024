import { Request, Response, NextFunction } from 'express'
import Conversations from '../models/conversation'
import successResponse from '../helpers/successResponse'
import { UserSchemaType } from '../models/user'
import { TryCatch } from '../helpers/TryCatch'
import { ErrorHandler } from '../middleware/errorResponse'
import mongoose from 'mongoose'
import message from '../models/message'
import axios from 'axios'

export async function getConversations(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.body
    const conversations = await Conversations.find({ organisation: id }).sort({
      _id: -1,
    })
    successResponse(res, conversations)
  } catch (error) {
    next(error)
  }
}

export const getConversation = TryCatch(async (req, res, next) => {
  const id = req.params.id
  const conversation = await Conversations.findById(id)
    .populate('collaborators')
    .sort({ _id: -1 })

  if (!conversation) {
    return next(new ErrorHandler(404, 'Conversation not found'))
  }

  // const conversations = await Conversations.findById(id).populate(
  //   'collaborators'
  // )
  const collaborators = [...conversation.collaborators]
  // Find the index of the collaborator with the current user's ID
  const currentUserIndex = conversation.collaborators.findIndex(
    (coworker: UserSchemaType) => coworker._id.toString() === req.user.id
  )

  //   // Remove the current user collaborator from the array
  conversation.collaborators.splice(currentUserIndex, 1)

  //   // Create the name field based on the other collaborator's username
  const name = conversation.collaborators[0]?.username || conversation.name

  successResponse(res, {
    ...conversation.toObject(),
    name,
    collaborators,
  })
})

export async function getSummary(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const conversationId = req.params.id

  try {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' })
    }

    console.log(conversationId)

    const conversation = await Conversations.findOne({
      _id: conversationId,
    })

    console.log(conversation)

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }

    // Fetch messages for the given conversation ID
    const messages = await message.find({ conversation: conversation._id })

    if (!messages || messages.length === 0) {
      return res
        .status(404)
        .json({ error: 'No messages found for this conversation' })
    }

    // Format messages as a string
    const formattedMessages = messages.map((message) => String(message.content))

    // Call the Python server for summarization
    const response = await axios.post('http://localhost:5002/summary', {
      messages: formattedMessages,
    })

    // Assuming the Python server returns the summary in a specific format
    const summary = response.data.summary // Adjust based on your Python API response

    return res.status(200).json({ messages: formattedMessages, summary })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
