import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { UploadedFile } from 'express-fileupload';
const Wishlist = require('../models/wishlist.model');
import { nanoid } from 'nanoid/async';
import { IWishlistItem } from '../models/wishlistItem.model';
const wlHelper = require('../helpers/wishlist.helper');
const fs = require('fs');
const sharp = require('sharp');


const getAllWishlists = async (req: Request, res: Response) => {
    const user = req.user;
    try {
        let wishlists = await Wishlist.find({createdBy: user!.id}, 'description title image hash');
        return res.status(200).json(wishlists);
    } catch (err) {
        return res.status(500).json({ errorCode: "WISHLIST_ERROR" });
    }
}

const updateWishlistVisibility = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    try {
        const user = req.user;
        const wishlistHash = req.params.hash;
        const visibility = req.body.visibility;
        const wishlistRes = await wlHelper.getWishlist(wishlistHash, user);

        if (wishlistRes.error) {
            return res.status(wishlistRes.error.errorCode).json({errorCode: wishlistRes.error.errorMsg});
        }

        const wishlist = wishlistRes.wishlist;
        wishlist.settings.visibility = visibility;
        await wishlist.save();
        return res.sendStatus(200);
    } catch (err) {
        return res.status(500).json({ errorCode: "WISHLIST_ERROR" });
    }

}
const createWishlist = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const title = req.body.title;
        const description = req.body.description;
        const image = req?.files?.image as UploadedFile;
        const user = req.user;

        const imageDir = process.env.USER_IMAGE_PATH || 'public/images/user/';
        let imageFileName = "";

        if (image) {
            imageFileName = 'wishlist-' + await nanoid(11) + '.' + image.mimetype.split('/')[1];
            if (!fs.existsSync(imageDir)) {
                await fs.promises.mkdir(imageDir, {recursive: true});
            }
            await sharp(image.data).resize(96, 96).toFile(imageDir + imageFileName);
        }

        const newWishList = new Wishlist({
            title: title,
            description: description,
            image: imageFileName.length > 0 ? imageFileName : undefined,
            createdBy: user!.id
        });

        // Save wishlist to database
        await newWishList.save();
        return res.status(200).json({ hash: newWishList.hash });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ errorCode: "WISHLIST_ERROR" });
    }
}

const readWishlist = async (req: Request, res: Response) => {
    const wishlistHash = req.params.hash;
    const user = req.user;
    const wishlistRes = await wlHelper.getWishlist(wishlistHash, user, false);

    if (wishlistRes.error) {
        return res.status(wishlistRes.error.errorCode).json({ errorCode: wishlistRes.error.errorMsg });
    }

    const wishlist = wishlistRes.wishlist;
    const isOwner = wishlist.createdBy._id.toString() === user?.id;
    const visibility = wishlist?.settings?.visibility;
    if ((!visibility || visibility === 'private') && !isOwner) {
        return res.status(404).json({ errorCode: "NOT_FOUND" });
    } else if (visibility === 'restricted' && !user) {
        return res.status(401).json({ errorCode: "UNAUTHORIZED" });
    }

    return res.status(200).json({
        wishlist: wishlist,
        isOwner: isOwner
    });
}

const updateWishlist = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    try {
        const wishlistHash = req.params.hash;
        const title = req.body.title;
        const description = req.body.description;
        const image = req?.files?.image as UploadedFile;
        const user = req.user;
        const deleteImage = req.body.deleteImage;
        const wishlistRes = await wlHelper.getWishlist(wishlistHash, user);

        if (wishlistRes.error) {
            return res.status(wishlistRes.error.errorCode).json({ errorCode: wishlistRes.error.errorMsg });
        }

        const wishlist = wishlistRes.wishlist;

        wishlist.title = title;
        wishlist.description = description;

        if (deleteImage) {
            if (wishlist.image) {
                await fs.promises.unlink(process.env.USER_IMAGE_PATH + wishlist.image);
                wishlist.image = null;
            }
        }
        else if (image) {
            if (wishlist.image) {
                // Delete old image
                try {
                    await fs.promises.unlink(process.env.USER_IMAGE_PATH + wishlist.image);
                } catch (err) {
                    // TODO: Log error
                }
            }

            const imageFileName = 'wishlist-' + await nanoid(11) + '.' + image.mimetype.split('/')[1];
            const fileUploaded = wlHelper.uploadWlImage(image, imageFileName);
            if (!fileUploaded) {
                return res.status(500).json({ errorCode: 'IMAGE_UPLOAD_ERROR' });
            }
            wishlist.image = imageFileName;
        }

        await wishlist.save();
        return res.sendStatus(200);
    } catch (err) {
        return res.status(500).json({ errorCode: "WISHLIST_ERROR" });
    }
}

const deleteWishlist = async (req: Request, res: Response) => {
    try {
        const wishlistHash = req.params.hash;
        const user = req.user;
        const wishlistRes = await wlHelper.getWishlist(wishlistHash, user);

        if (wishlistRes.error) {
            return res.status(wishlistRes.error.errorCode).json({ errorCode: wishlistRes.error.errorMsg });
        }

        const wishlist = wishlistRes.wishlist;

        if (wishlist.image) {
            try {
                await fs.promises.unlink(process.env.USER_IMAGE_PATH + wishlist.image);
            } catch (err) {
                // TODO: Log error
            }
        }
        // Delete wishlist item images
        const wishlistItems = wishlist.items as Array<IWishlistItem>;
        for (let i = 0; i < wishlistItems.length; i++) {
            if (wishlistItems[i].image) {
                try {
                    await fs.promises.unlink(process.env.USER_IMAGE_PATH + wishlistItems[i].image);
                } catch (err) {
                    // TODO: Log error
                }
            }
        }

        await wishlist.deleteOne();
        return res.sendStatus(200);
    } catch (err) {
        return res.status(500).json({ errorCode: "WISHLIST_ERROR" });
    }
}

module.exports = {
    createWishlist,
    readWishlist,
    updateWishlist,
    deleteWishlist,
    getAllWishlists,
    updateWishlistVisibility
}