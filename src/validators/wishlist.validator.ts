import { check, body } from 'express-validator';

const createWishlistValidator = () => {
    return [
        body('title')
            .trim()
            .isString().notEmpty().withMessage('TITLE_REQ').bail()
            .isLength({ min: 1, max: 50 }).withMessage('TITLE_LEN'),
        body('description')
            .trim()
            .isString().notEmpty().withMessage('DESCRIPTION_REQ').bail()
            .isLength({ min: 1, max: 500 }).withMessage('DESCRIPTION_LEN'),
        check('image')
            .custom((value, { req }) => {
                if (!req?.files?.image) throw new Error('NOT_IMAGE');
                if (req.files.image instanceof Array) throw new Error('IMAGE_COUNT');
                if (req.files.image.size > (3 * 1024 * 1024) && req.files.image.size < 10)
                    throw new Error('IMAGE_SIZE');
                const mimetype = req.files.image.mimetype;
                if (mimetype != "image/png" && mimetype != "image/jpg" && mimetype != "image/jpeg") {
                    throw new Error('IMAGE_FORMAT');
                }
                return true;
            })
    ];
}

module.exports = {
    createWishlistValidator,
}