import { Types } from 'mongoose';

export {}
declare global {
    namespace Express {
        interface User {
            id: Types.ObjectId;
            username: string;
            email: string;
            role: string;
            image: string;
        }
    }
}