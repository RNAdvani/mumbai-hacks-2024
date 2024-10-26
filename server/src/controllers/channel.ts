import { Request, Response, NextFunction } from 'express'
import Channel from '../models/channel'
import successResponse from '../helpers/successResponse'
import { TryCatch } from '../helpers/TryCatch'
import { ErrorHandler } from '../middleware/errorResponse'

// @desc    create channel
// @route   POST /api/v1/channel/create
// @access  Private
export async function createChannel(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, organisationId } = req.body
    const channel = await Channel.create({
      name,
      collaborators: [req.user.id],
      organisation: organisationId,
    })
    successResponse(res, channel)
  } catch (error) {
    next(error)
  }
}

export async function getChannels(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id
    const channels = await Channel.find({ organisation: id })
      .populate({
        path: 'organisation',
        populate: [{ path: 'owner' }, { path: 'coWorkers' }],
      })
      .populate('collaborators')
      .sort({ _id: -1 })

    successResponse(res, channels)
  } catch (error) {
    next(error)
  }
}

export const getChannel = TryCatch(async(req,res,next)=>{
  const id = req.params.id
  const channel = await Channel.findById(id)
    .populate('collaborators')
    .sort({ _id: -1 })

  if (!channel) {
    return next(new ErrorHandler(404, 'Channel not found'))
  }

  const updatedChannel = {
    ...channel.toObject(),
    isChannel: true,
  }

  successResponse(res, updatedChannel)
})

export const updateChannel = TryCatch(async(req,res,next)=>{
  const id = req.params.id
    const channel = await Channel.findById(id)
    if (!channel) {
      return next(new ErrorHandler(404, 'Channel not found'))
    }

    const updatedChannel = await Channel.findByIdAndUpdate(
      id,
      { $addToSet: { collaborators: req.body.userId } },
      {
        new: true,
      }
    )

    successResponse(res, updatedChannel)
  })