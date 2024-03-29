import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { nanoid } from 'nanoid/async';
import { HydratedDocument } from 'mongoose';
import { IWishlistItem } from '../models/wishlistItem.model';
const Wishlist = require('../models/wishlist.model');
const wlHelper = require('../helpers/wishlist.helper');
const fs = require('fs');


const createWishListItem = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const { wishlistHash, name, subtitle, price, url, note, user, image } = wlHelper.getWlItemRequestValues(req);

        const wishlist = await Wishlist.findOne({ hash: wishlistHash, createdBy: user!.id });
        if (!wishlist) {
            return res.status(400).json({ errorCode: 'WISHLIST_NOT_FOUND' });
        }

        let imageFileName = "";

        if (image) {
            imageFileName = wishlistHash + '-item-' + await nanoid(11) + '.' + image.mimetype.split('/')[1];
            const fileUploaded = wlHelper.uploadWlImage(image, imageFileName);
            if (!fileUploaded) {
                return res.status(500).json({ errorCode: 'IMAGE_UPLOAD_ERROR' });
            }
        }

        const newWishListItem = {
            name: name,
            subtitle: subtitle,
            price: price,
            url: url,
            note: note,
            image: imageFileName.length > 0 ? imageFileName : undefined,
        };

        wishlist.items.push(newWishListItem);
        await wishlist.save();
        return res.sendStatus(200);
    } catch (err) {
        return res.status(500).json({ errorCode: 'ITEM_ERROR' });
    }
}

const readWishListItem = async (req: Request, res: Response) => {
    try {
        const wishlistHash = req.params.hash;
        const wishlistItemId = req.params.wishlistItemId;
        const user = req.user;

        const wishlist = await Wishlist.findOne({hash: wishlistHash, createdBy: user!.id, 'items._id': wishlistItemId});
        if (!wishlist) {
            return res.status(400).json({errorCode: 'ITEM_NOT_FOUND'});
        }

        const wishlistItem = wishlist.items.id(wishlistItemId);
        if (!wishlistItem) {
            return res.status(400).json({errorCode: 'ITEM_NOT_FOUND'});
        }
        return res.status(200).json(wishlistItem);
    } catch (err) {
        return res.status(500).json({errorCode: 'ITEM_ERROR'});
    }
}

const updateWishListItem = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const {wishlistHash, name, subtitle, price, url, note, user, image} = wlHelper.getWlItemRequestValues(req);
        const wishlistItemId = req.params.wishlistItemId;

        const wishlist = await Wishlist.findOne({hash: wishlistHash, createdBy: user!.id,});
        if (!wishlist) {
            return res.status(400).json({errorCode: 'ITEM_NOT_FOUND'});
        }
        const wishlistItem = wishlist.items.id(wishlistItemId);
        if (!wishlistItem) {
            return res.status(400).json({errorCode: 'ITEM_NOT_FOUND'});
        }

        wishlistItem.name = name;
        wishlistItem.subtitle = subtitle;
        wishlistItem.price = price;
        wishlistItem.url = url;
        wishlistItem.note = note;

        if (image) {
            // Delete old image
            if (wishlistItem.image) {
                try {
                    await fs.promises.unlink(process.env.USER_IMAGE_PATH + wishlistItem.image);
                } catch (err) {
                    // TODO: Handle error by logging
                }
            }

            const imageFileName = wishlistHash + '-item-' + await nanoid(11) + '.' + image.mimetype.split('/')[1];
            const fileUploaded = await wlHelper.uploadWlImage(image, imageFileName);
            if (!fileUploaded) {
                return res.status(500).json({errorCode: 'IMAGE_UPLOAD_ERROR'});
            }
            wishlistItem.image = imageFileName;
        }

        await wishlist.save();
        return res.sendStatus(200);
    } catch (err) {
        return res.status(500).json({errorCode: 'ITEM_ERROR'});
    }
}

const deleteWishListItem = async (req: Request, res: Response) => {
    try {
        const wishlistHash = req.params.hash;
        const wishlistItemId = req.params.wishlistItemId;
        const user = req.user;

        const wishlist = await Wishlist.findOne({hash: wishlistHash, createdBy: user!.id, 'items._id': wishlistItemId});
        if (!wishlist) {
            return res.status(400).json({errorCode: 'ITEM_NOT_FOUND'});
        }
        const wishlistItem = wishlist.items.id(wishlistItemId) as HydratedDocument<IWishlistItem> | null;
        if (wishlistItem?.image) {
            try {
                await fs.promises.unlink(process.env.USER_IMAGE_PATH + wishlistItem.image);
            } catch (err) {
                // TODO: Handle error by logging
            }
        }
        await wishlist.items.pull(wishlistItemId);

        await wishlist.save();
        return res.sendStatus(200);
    } catch (err) {
        return res.status(500).json({errorCode: 'ITEM_ERROR'});
    }
}

module.exports = {
    createWishListItem,
    readWishListItem,
    updateWishListItem,
    deleteWishListItem,
}