import { NextFunction, Request, Response } from 'express';

const userMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user) next();
    else return res.status(401).json({errorCode:"NO_PERMISSION"});
}

module.exports = userMiddleware;