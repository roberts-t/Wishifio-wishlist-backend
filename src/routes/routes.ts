const express = require('express');
const router = express.Router();
const guestMiddleware = require('../middlewares/guest.middleware');
const userMiddleware = require('../middlewares/user.middleware');

const authControllers = require('../controllers/auth.controllers');
const authValidator = require('../validators/auth.validator');
const resetPasswordController = require('../controllers/reset-password.controller');
const resetPasswordValidator = require('../validators/requestPassword.validator');
const wishlistControllers = require('../controllers/wishlist.controller');
const wishlistValidator = require('../validators/wishlist.validator');
const wishlistItemControllers = require('../controllers/wishlistItem.controller');
const wishlistItemValidator = require('../validators/wishlistItem.validator');


// Auth Routes
router.get('/auth/user', authControllers.user);
router.get('/logout', [userMiddleware], authControllers.logout);
router.post('/signup', [guestMiddleware, authValidator.signUpValidator()], authControllers.signUp);
router.post('/login', [guestMiddleware], authControllers.signIn);

// Reset Password Routes
router.post('/reset-password-request/',
    [guestMiddleware, resetPasswordValidator.requestPasswordValidator()],
    resetPasswordController.requestResetPassword
);
router.post('/reset-password/',
    [guestMiddleware, resetPasswordValidator.resetPasswordValidator()],
    resetPasswordController.resetPassword
);


// Wishlist Routes
router.post(
    '/wishlist/create',
    [userMiddleware, wishlistValidator.createWishlistValidator()],
    wishlistControllers.createWishlist
);
router.get('/wishlists', [userMiddleware], wishlistControllers.getAllWishlists);
router.get('/wishlist/:hash', wishlistControllers.readWishlist);
router.put('/wishlist/:hash/',
    [userMiddleware, wishlistValidator.createWishlistValidator()],
    wishlistControllers.updateWishlist);
router.delete('/wishlist/:hash', [userMiddleware], wishlistControllers.deleteWishlist);
router.put(
    '/wishlist/:hash/share',
    [userMiddleware, wishlistValidator.updateWishlistVisibilityValidator()],
    wishlistControllers.updateWishlistVisibility
);


// Wishlist Item Routes
router.post(
    '/wishlist/:hash/item/create',
    [userMiddleware, wishlistItemValidator.createWishlistItemValidator()],
    wishlistItemControllers.createWishListItem
);
router.get(
    '/wishlist/:hash/item/:wishlistItemId',
    [userMiddleware],
    wishlistItemControllers.readWishListItem
);
router.put(
    '/wishlist/:hash/item/:wishlistItemId/',
    [userMiddleware, wishlistItemValidator.createWishlistItemValidator()],
    wishlistItemControllers.updateWishListItem
);
router.delete(
    '/wishlist/:hash/item/:wishlistItemId/',
    [userMiddleware],
    wishlistItemControllers.deleteWishListItem
);

module.exports = router