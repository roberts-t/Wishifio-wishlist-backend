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
            .isString().notEmpty().withMessage('PASSWORD_MATCH').bail()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('PASSWORD_MATCH');
                }
                return true;
            })
    ];
}

const changePasswordValidator = () => {
    return [
        body('password')
            .trim()
            .isString().notEmpty().withMessage('INVALID_PASSWORD').bail()
            .isLength({ min: 6 }).withMessage('INVALID_PASSWORD'),
        body('newPassword')
            .trim()
            .isString().notEmpty().withMessage('NEW_PASSWORD_REQ').bail()
            .isLength({ min: 6 }).withMessage('NEW_PASSWORD_MIN'),
        body('newPasswordConfirm')
            .trim()
            .isString().notEmpty().withMessage('PASSWORD_MATCH').bail()
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('PASSWORD_MATCH');
                }
                return true;
            })
    ];

}

module.exports = {
    requestPasswordValidator,
    resetPasswordValidator,
    changePasswordValidator,
}