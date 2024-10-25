export interface User extends Document {
    clerkId: string;
    name: string;
    email: string; 
  }
  
export type Role = 'admin' | 'user' | 'guest';

  