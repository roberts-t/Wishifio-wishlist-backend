import mongoose, { Schema, Types } from 'mongoose';
import { IWishlistItem } from './wishlistItem.model';
const WishListItem = require('./wishlistItem.model');
import { nanoid } from 'nanoid';

export interface IWishlist extends Document {
    _id: Types.ObjectId;
    hash: string;
    title: string;
    description: string;
    image: string;
    createdBy: Types.ObjectId;
    items: Types.DocumentArray<IWishlistItem>;
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
        unique: true,
        index: true,
        default: () => nanoid(11)
    },
    title: {
        type: String,
        required: true,
        maxlength: 50,
        minLength: 1,
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
        type: [WishListItem.schema],
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
    }, {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

WishlistSchema.virtual('imageUrl').get(function() {
    if (this.image) {
        return `/static/images/user/${this.image}`;
    } else {
        return '/static/images/default/wishlist-image.jpg';
    }
});

module.exports = mongoose.model<IWishlist>('Wishlist', WishlistSchema);