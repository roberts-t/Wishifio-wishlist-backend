import { PassportStatic } from 'passport';
import { IUser } from '../models/user.model';
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user.model');



module.exports = function (passport: PassportStatic) {
    passport.use(
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        }, async (email: string, password: string, callback: Function) => {
            try {
                await User.findOne({email: email}).then(async (user: IUser) => {
                    if (!user) {
                        return callback(null, false, {message: 'AUTH_INCORRECT'})
                    }
                    await bcrypt.compare(password, user.password, (err: Error | undefined, result: boolean) => {
                        if (err) {
                            return callback(null, false, {message: 'AUTH_ERROR'});
                        }
                        if (result) {
                            return callback(null, user);
                        } else {
                            return callback(null, false, {message: 'AUTH_INCORRECT'})
                        }
                    });
                }).catch(() => {
                    return callback(null, false, {message: 'AUTH_ERROR'});
                });
            } catch (err) {
                return callback(null, false, {message: 'AUTH_ERROR'});
            }
        })
    );

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id).then(function (user: IUser) {
            const userInfo = {
                id: user._id.toHexString(),
                username: user.username,
                email: user.email,
                role: user.role,
                image: user.image,
            }
            done(null, userInfo);
        }).catch((err: Error) => {
            done(err, null);
        });
    });
}