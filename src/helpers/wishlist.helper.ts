import { UploadedFile } from 'express-fileupload';
import { Request } from 'express';
const Wishlist = require('../models/wishlist.model');
import { IWishlist } from '../models/wishlist.model';
import { HydratedDocument } from 'mongoose';
import { IWishlistItem } from '../models/wishlistItem.model';

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
    const imageDir = process.env.USER_IMAGE_PATH;
    try {
        await image.mv(imageDir + imageFileName);
        return true;
    } catch (e) {
        // TODO: Log error
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
        return {
            errorCode: 'ITEM_ERROR'
        };
    }

    return {
        wishlist,
        wishlistItem
    }
}

const getWishlist = async (wishlistHash: string, user: any) => {
    let wishlist: HydratedDocument<IWishlist>;
    try {
        wishlist = await Wishlist.findOne({ hash: wishlistHash, createdBy: user!.id },
            'description hash image items settings title createdBy')
            .populate('items')
            .populate('createdBy', 'username');
        if (!wishlist) {
            return {
                error: {
                    errorCode: 400,
                    errorMsg: 'WISHLIST_NOT_FOUND'
                },
            };
        }
    }
    catch (e) {
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

module.exports = {
    getWlItemRequestValues,
    uploadWlImage,
    getWlItem,
    getWishlist
}