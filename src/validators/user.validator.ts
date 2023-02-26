import { body } from 'express-validator';

const updateUserValidator = () => {
    return [
        body('username')
            .trim()
            .isString().notEmpty().withMessage('USERNAME_REQ').bail()
            .isLength({ min: 3, max: 20 }).withMessage('USERNAME_LEN'),
    ];
}

module.exports = {
    updateUserValidator
}