import { body } from 'express-validator';

const requestPasswordValidator = () => {
    return [
        body('email')
            .trim()
            .isString().notEmpty().withMessage('EMAIL_REQ').bail()
            .isEmail().withMessage('EMAIL_INVALID'),
    ];
}

const resetPasswordValidator = () => {
    return [
        body('token')
            .trim()
            .isString().notEmpty().withMessage('INVALID_TOKEN'),
        body('userId')
            .trim()
            .isString().notEmpty().withMessage('INVALID_TOKEN'),
        body('password')
            .trim()
            .isString().notEmpty().withMessage('PASSWORD_REQ').bail()
            .isLength({ min: 6 }).withMessage('PASSWORD_MIN'),
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

module.exports = {
    requestPasswordValidator,
    resetPasswordValidator
}