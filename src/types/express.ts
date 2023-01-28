export {}
declare global {
    namespace Express {
        interface User {
            id: string;
            username: string;
            email: string;
            role: string;
            image: string;
        }
    }
}