import { Request, Response } from 'express';

const User = require('../models/user.model');

const updateUser = async (req: Request, res: Response) => {
    const user = req.user;
    try {
        const dbUser = await User.findById(user?.id);
        if (!dbUser) {
            return res.status(403).json({errorCode: 'NO_PERMISSION'});
        }

        dbUser.username = req.body.username;
        await dbUser.save();
        return res.sendStatus(200);
    } catch (err) {
        return res.status(500).json({errorCode: 'SERVER_ERROR'});
    }
}

module.exports = {
    updateUser
}