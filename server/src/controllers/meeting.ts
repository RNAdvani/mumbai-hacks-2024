import { Request, Response } from 'express'
import User from '../models/user'
import Organisation from '../models/organisation'
import { generateToken } from '../helpers/zegoToken'
import Meeting from '../models/meeting'
import axios from 'axios'

export async function createMeeting(req: Request, res: Response) {
  try {
    const {
      title,
      description,
      scheduledStartTime,
      scheduledEndTime,
      participantIds,
    } = req.body

    // Check if user is a manager
    const user = await User.findById(req.user.id)
    const org = await Organisation.findOne({
      $or: [{ owner: req.user.id }, { managers: req.user.id }],
    })

    if (!org || (user.role !== 'manager' && user.role !== 'owner')) {
      return res.status(403).json({
        success: false,
        message: 'Only managers can create meetings',
      })
    }

    // Generate unique room ID
    const roomId = `${org._id}-${Date.now()}`

    // Generate ZEGO token
    const token = generateToken(
      process.env.ZEGO_APP_ID,
      process.env.ZEGO_SERVER_SECRET,
      roomId,
      req.user.id
    )

    const meeting = await Meeting.create({
      title,
      description,
      organizer: req.user.id,
      organisation: org._id,
      participants: participantIds.map((id) => ({ user: id })),
      scheduledStartTime,
      scheduledEndTime,
      zegoToken: token,
      roomId,
    })

    res.status(201).json({
      success: true,
      data: meeting,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export async function joinMeeting(req: Request, res: Response) {
  try {
    const { meetingId } = req.params

    const meeting = await Meeting.findById(meetingId)
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found',
      })
    }

    // Check if user is part of the organization
    const org = await Organisation.findById(meeting.organisation)
    if (
      !org.coWorkers.includes(req.user.id) &&
      !org.managers.includes(req.user.id) &&
      org.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to join this meeting',
      })
    }

    // Generate participant token
    const participantToken = generateToken(
      process.env.ZEGO_APP_ID,
      process.env.ZEGO_SERVER_SECRET,
      meeting.roomId,
      req.user.id
    )

    // Update participant join time
    await Meeting.findByIdAndUpdate(meetingId, {
      $push: {
        participants: {
          user: req.user.id,
          joinedAt: new Date(),
        },
      },
    })

    res.status(200).json({
      success: true,
      data: {
        roomId: meeting.roomId,
        token: participantToken,
      },
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export async function startRecording(req: Request, res: Response) {
  const { meetingId } = req.params

  try {
    const meeting = await Meeting.findById(meetingId)
    if (!meeting) {
      return res
        .status(404)
        .json({ success: false, message: 'Meeting not found' })
    }

    // Check if the user is authorized to start recording
    if (meeting.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only meeting organizer can start recording',
      })
    }

    // API request to start recording
    const response = await axios.post(
      'https://cloudrecord-api.zego.im/?Action=StartRecord',
      {
        room_id: meeting.roomId,
      }
    )

    const recordingId = response.data['Data']['TaskID']
    if (!recordingId) {
      return res
        .status(500)
        .json({ success: false, message: 'Failed to start recording' })
    }

    await Meeting.findByIdAndUpdate(meetingId, {
      'recording.startedAt': new Date(),
      'recording.id': recordingId,
    })

    res
      .status(200)
      .json({ success: true, message: 'Recording started', recordingId })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export async function endMeeting(req: Request, res: Response) {
  const { meetingId } = req.params

  try {
    const meeting = await Meeting.findById(meetingId)
    if (!meeting) {
      return res
        .status(404)
        .json({ success: false, message: 'Meeting not found' })
    }

    if (meeting.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only meeting organizer can end the meeting',
      })
    }

    let recordingUrl = null

    if (meeting.recording?.url) {
      // API request to stop recording
      const response = await axios.post(
        'https://cloudrecord-api.zego.im/?Action=StopRecord',
        {
          room_id: meeting.roomId,
          recording_id: meeting.recording.url,
        }
      )

      // Check if the recording URL is available
      recordingUrl = response.data?.file_url
      if (!recordingUrl) {
        return res
          .status(500)
          .json({ success: false, message: 'Failed to retrieve recording URL' })
      }

      await Meeting.findByIdAndUpdate(meetingId, {
        status: 'completed',
        actualEndTime: new Date(),
        'recording.endedAt': new Date(),
        'recording.url': recordingUrl,
      })
    }

    res.status(200).json({
      success: true,
      message: 'Meeting ended successfully',
      recordingUrl,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}
