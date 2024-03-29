import mongoose, { Schema } from 'mongoose';

export interface IWishlistItem extends Document {
    name: string;
    subtitle: string;
    price: string;
    url: string;
    image: string;
    note: string;
}

const WishlistItemSchema: Schema = new Schema({
        name: {
            type: String,
            required: true,
            maxlength: 50,
        },
        subtitle: {
            type: String,
            required: false,
            maxlength: 200,
        },
        price: {
            type: String,
            required: false,
        },
        url: {
            type: String,
            required: false,
        },
        image: {
            type: String,
            required: false
        },
        note: {
            type: String,
            required: false,
            maxlength: 500,
        },
    }, {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

WishlistItemSchema.virtual('imageUrl').get(function() {
    if (this.image) {
        return `/static/images/user/${this.image}`;
    } else {
        return '/static/images/default/wishlist-image.jpg';
    }
});

module.exports = mongoose.model<IWishlistItem>('WishlistItem', WishlistItemSchema);