import { NextFunction, Request, Response } from 'express';
const User = require('../models/user.model');
const passport = require('passport');
const bcrypt = require('bcrypt');
require('../config/passport.config')(passport);
import { validationResult } from 'express-validator';
const logger = require('../helpers/logger.helper');

const user = async (req: Request, res: Response) => {
    return res.send(req.user);
}

const signIn = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    passport.authenticate('local', {}, (err: Error | undefined, user: Express.User, info: { message: string }) => {
        if (err) {
            logger.error(err);
            return res.status(500).json({ errorCode: 'AUTH_ERROR' });
        }
        if (!user) {
            return res.status(400).json({ errorCode: info.message || 'AUTH_INCORRECT' });
        } else {
            req.logIn(user, (err) => {
                if (err) {
                    logger.error(err);
                    return res.status(500).json({ errorCode: 'AUTH_ERROR' });
                } else {
                    if (req.body && req.body.remember) {
                        // Set session age to one month
                        try {
                            req.session.cookie.originalMaxAge = 2629800000;
                        } catch (e) {
                            logger.error(e);
                        }
                    }
                    return res.sendStatus(200);
                }
            });
        }
    })(req, res, next);
}

const logout = async (req: Request, res: Response) => {
    req.logout({}, (err) => {
        if (err) {
            logger.error(err);
            return res.sendStatus(500);
        }
        else return res.sendStatus(200);
    });
}

const signUp = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;

    const user = await User.findOne({email: email});
    if (user) return res.status(400).json({errorCode: "USER_EXISTS"});
    else {
        return await bcrypt.hash(password, 10, async (err: Error | undefined, hashedPassword: string) => {
            if (err) {
                logger.error(err);
                return res.status(500).json({errorCode: "REGISTER_ERROR"});
            }
            const newUser = new User({
                email: email,
                password: hashedPassword,
                username: username
            });
            newUser.save((err: any) => {
                if (err) {
                    logger.error(err);
                    return res.status(500).json({errorCode: "REGISTER_ERROR"});
                }
                else return res.status(200).json({id: newUser._id});
            });
        });
    }
}

module.exports = {
    user,
    signUp,
    signIn,
    logout
}