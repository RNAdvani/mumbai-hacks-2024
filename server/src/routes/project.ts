import express from 'express';
import { createProject, getProjects } from '../controllers/project';
const router = express.Router();

router.post("/create",createProject)
router.get("/get/:id",getProjects)

export {router as projectRoutes}