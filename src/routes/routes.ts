const express = require('express');
const router = express.Router();
import { Request, Response } from 'express';
const guestMiddleware = require('../middlewares/guest.middleware');
const authControllers = require('../controllers/auth.controllers');
const authValidator = require('../validators/auth.validator');


router.get('/', (req: Request, res: Response) => {
    res.send('Hello World!')
});

// Auth Routes
router.get('/user', authControllers.user);
router.get('/logout', authControllers.logout);
router.post('/signup', [guestMiddleware, authValidator.signUpValidator()], authControllers.signUp);
router.post('/login', [guestMiddleware, authValidator.signInValidator()], authControllers.signIn);






module.exports = router