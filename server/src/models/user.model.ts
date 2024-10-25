import { User as userSchema  } from '@my-org/types'; 
import mongoose from 'mongoose';

interface IUser extends userSchema {};

const userSchema = new mongoose.Schema<IUser>({
    clerkId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
});

export const User = mongoose.model<IUser>('User', userSchema);
