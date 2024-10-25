import express from 'express'
import { protect } from '../middleware/protect'
import {
  createMeeting,
  joinMeeting,
  startRecording,
  endMeeting,
} from '../controllers/meeting'

const router = express.Router()

router.post('/', protect, createMeeting)
router.post('/:meetingId/join', protect, joinMeeting)
router.post('/:meetingId/record', protect, startRecording)
router.post('/:meetingId/end', protect, endMeeting)

export default router
