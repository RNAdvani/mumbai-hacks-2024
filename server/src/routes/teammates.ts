import express from 'express'
import { createTeammates, getTeammate, getTeammates } from '../controllers/teammates'
import { protect } from '../middleware/protect'

const router = express.Router()

router.get('/:id', protect, getTeammate)
router.post('/', protect, createTeammates)
router.get("/employees/:id", protect, getTeammates)

export default router
