import express from 'express'
import { createTask, getTasks, updateTask } from '../controllers/tasks'
import { protect } from '../middleware/protect';
const router = express.Router()

router.post('/create',protect, createTask)
router.post("/get", protect,getTasks);
router.post("/update",protect, updateTask);


export { router as taskRoutes }