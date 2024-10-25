import express, { Request, Response } from 'express';
import { createUser } from '../controllers/user.controller';
import bodyParser from 'body-parser';
const router = express.Router();

router.post("/create",bodyParser.raw({type: 'application/json'}),createUser);


export { router as userRoutes };