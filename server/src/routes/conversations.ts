import express from 'express'
import {
  getConversation,
  getConversations,
  getSummary,
} from '../controllers/conversations'
import { protect } from '../middleware/protect'

const router = express.Router()

router.get('/', protect, getConversations)
router.get('/:id', protect, getConversation)
router.post('/summarize/:id', getSummary)

export default router
