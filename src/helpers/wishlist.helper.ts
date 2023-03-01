import { UploadedFile } from 'express-fileupload';
import { Request } from 'express';
const Wishlist = require('../models/wishlist.model');
import { IWishlist } from '../models/wishlist.model';
import { HydratedDocument } from 'mongoose';
import { IWishlistItem } from '../models/wishlistItem.model';
import fs from "fs";
const sharp = require('sharp');
const logger = require('../helpers/logger.helper');

const getWlItemRequestValues = (req: Request) => {
    const wishlistHash = req.params.hash;
    const name = req.body.name;
    const subtitle = req.body.subtitle;
    const price = req.body.price;
    const url = req.body.url;
    const note = req.body.note;
    const user = req.user;
    const image = req?.files?.image as UploadedFile;

    return {
        wishlistHash,
        name,
        subtitle,
        price,
        url,
        note,
        user,
        image
    }
}

const uploadWlImage = async (image: UploadedFile, imageFileName: string) => {
    const imageDir = process.env.USER_IMAGE_PATH || 'public/images/user/';
    try {
        if (!fs.existsSync(imageDir)) {
            await fs.promises.mkdir(imageDir, {recursive: true});
        }
        await sharp(image.data)
            .resize(256, 192)
            .jpeg({quality: 100})
            .toFile(imageDir + imageFileName);
        return true;
    } catch (e) {
        logger.error(e);
        return false;
    }
}

const getWlItem = async (wishlistId: string, wishlistItemId: string, user: any) => {
    let wishlist: HydratedDocument<IWishlist>;
    let wishlistItem: HydratedDocument<IWishlistItem> | null;

    try {
        wishlist = await Wishlist.findOne({ _id: wishlistId, createdBy: user!.id,  });
        if (!wishlist) {
            return {
                errorCode: 'ITEM_NOT_FOUND'
            };
        }
        wishlistItem = wishlist.items.id(wishlistItemId);
        if (!wishlistItem) {
            return {
                errorCode: 'ITEM_NOT_FOUND'
            };
        }
    }
    catch (e) {
        logger.error(e);
        return {
            errorCode: 'ITEM_ERROR'
        };
    }

    return {
        wishlist,
        wishlistItem
    }
}

const getWishlist = async (wishlistHash: string, user: any, matchUser: boolean = true) => {
    let wishlist: HydratedDocument<IWishlist>;
    let query: any = { hash: wishlistHash, createdBy: user?.id };
    if (!matchUser) {
        query = { hash: wishlistHash };
    }
    try {
        wishlist = await Wishlist.findOne(query,
            'description hash image items settings title createdBy')
            .populate('items')
            .populate('createdBy', 'username');
        if (!wishlist) {
            return {
                error: {
                    errorCode: 404,
                    errorMsg: 'NOT_FOUND'
                },
            };
        }
    }
    catch (e) {
        logger.error(e);
        return {
            error: {
                errorCode: 500,
                errorMsg: 'WISHLIST_ERROR'
            }
        };
    }

    return {
        wishlist,
    }
}

const deleteWlImage = async (imagePath: string) => {
    try {
        await fs.promises.unlink(imagePath);
    } catch (err) {
        logger.error(err);
    }
}

module.exports = {
    getWlItemRequestValues,
    uploadWlImage,
    getWlItem,
    getWishlist,
    deleteWlImage
}