import { NextFunction, Request, Response } from 'express';

const guestMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) next();
    else return res.status(400).json({errorCode:"NO_PERMISSION"});
}

module.exports = guestMiddleware;