import { Request, Response } from 'express';
import { nanoid } from 'nanoid/async';
const User = require('../models/user.model');
const ResetPassword = require('../models/resetPassword.model');
const bcrypt = require('bcrypt');

const requestResetPassword = async (req: Request, res: Response) => {
    const email = req.body.email;

    try {
        const user = User.findOne({ email: email });
        if (!user) {
            // Send status 200 to prevent user enumeration
            return res.sendStatus(200);
        }

        const token = await nanoid();
        const tokenHash = await bcrypt.hash(token, 10);
        const resetPasswordEntry = new ResetPassword({
            token: tokenHash,
            userId: user._id
        });

        await resetPasswordEntry.save();
        return res.sendStatus(200);
    } catch (e) {
        return res.status(500).json({ errorCode: 'SERVER_ERROR' });
    }
}

const resetPassword = async (req: Request, res: Response) => {
    const token = req.body.token;
    const password = req.body.password;
    const userId = req.body.userId;

    try {
        const passResetEntry = await ResetPassword.findOne({ userId: userId });
        if (!passResetEntry) {
            return res.status(400).json({ errorCode: 'INVALID_TOKEN' });
        }

        const isTokenValid = await bcrypt.compare(token, passResetEntry.token);
        if (!isTokenValid) {
            return res.status(400).json({ errorCode: 'INVALID_TOKEN' });
        }

        const newPasswordHash = await bcrypt.hash(password, 10);
        await User.updateOne(
            { _id: userId },
            { $set: { password: newPasswordHash }},
        );
        await passResetEntry.deleteOne();

        // TODO: Send email to user that password has been reset

        return res.sendStatus(200);
    } catch (e) {
        return res.status(500).json({ errorCode: 'SERVER_ERROR' });
    }
}

module.exports = {
    requestResetPassword,
    resetPassword
}