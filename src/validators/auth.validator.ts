import { body } from 'express-validator';

const signUpValidator = () => {
    return [
        body('email')
            .trim()
            .isString().notEmpty().withMessage('EMAIL_REQ').bail()
            .isEmail().withMessage('EMAIL_INVALID'),
        body('password')
            .trim()
            .isString().notEmpty().withMessage('PASSWORD_REQ').bail()
            .isLength({ min: 6 }).withMessage('PASSWORD_MIN'),
        body('username')
            .trim()
            .isString().notEmpty().withMessage('USERNAME_REQ').bail()
            .isLength({ min: 3, max: 20 }).withMessage('USERNAME_LEN'),
        body('c_password')
            .trim()
            .isString().notEmpty().withMessage('C_PASSWORD_REQ').bail()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('PASSWORD_MATCH');
                }
                return true;
            })
    ];
}

const signInValidator = () => {
    return [
        body('email')
            .trim()
            .isString().notEmpty().withMessage('EMAIL_REQ').bail(),
        body('password')
            .trim()
            .isString().notEmpty().withMessage('PASSWORD_REQ').bail(),
    ];
}

module.exports = {
    signUpValidator,
    signInValidator
}