import mongoose, { Schema, Types } from 'mongoose';
import { IWishlistItem } from './wishlistItem.model';
const wishListItemsSchema = require('./wishlistItem');

export interface IWishlist extends Document {
    _id: Types.ObjectId;
    hash: string;
    title: string;
    description: string;
    image: string;
    createdBy: Types.ObjectId;
    items: IWishlistItem[];
    settings: {
        isShared: boolean;
    }
    createdAt: Date;
    updatedAt: Date;
}

const WishlistSchema: Schema = new Schema({
    _id: {
        type: Types.ObjectId,
        required: true,
        auto: true
    },
    hash: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 50,
    },
    description: {
        type: String,
        required: false,
        maxlength: 500,
    },
    image: {
        type: String,
        required: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: {
        type: [wishListItemsSchema],
        required: true,
        default: [],
    },
    settings: {
        isShared: {
            type: Boolean,
            required: true,
            default: false
        },
    }
    }, {timestamps: true}
);

module.exports = mongoose.model<IWishlist>('Wishlist', WishlistSchema);