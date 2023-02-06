import { check, body, param } from 'express-validator';

const createWishlistItemValidator = () => {
    return [
        param('hash')
            .trim()
            .notEmpty().withMessage('WISHLIST_HASH_REQ'),
        body('name')
            .trim()
            .isString().notEmpty().withMessage('NAME_REQ').bail()
            .isLength({ min: 1, max: 50 }).withMessage('NAME_LEN'),
        body('subtitle')
            .optional().trim()
            .isLength({ min: 1, max: 200 }).withMessage('SUBTITLE_LEN'),
        body('price')
            .trim()
            .isString().notEmpty().withMessage('PRICE_REQ').bail()
            .isLength({ min: 1, max: 10 }).withMessage('PRICE_LEN'),
        body('url')
            .optional().trim()
            .isURL().withMessage('URL_INVALID'),
        body('note')
            .optional().trim()
            .isLength({ min: 1, max: 500 }).withMessage('NOTES_LEN'),
        check('image')
            .optional()
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
    createWishlistItemValidator,
}