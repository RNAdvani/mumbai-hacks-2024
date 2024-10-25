import express, { Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRoutes } from './routes/user.routes';
import { errorMiddleware } from './lib/ErrorHandler';
import { connectDb } from './lib/db';
import morgan from 'morgan';

dotenv.config({
    path: '.env',
});

const PORT = process.env.PORT as string;

const app = express();
app.use(express.json());
connectDb();

app.use(cors({
    origin: ['http://localhost:3000 '],
}));

app.use('/api/v1/users',userRoutes);


app.use(morgan('dev'));
app.use(errorMiddleware)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});