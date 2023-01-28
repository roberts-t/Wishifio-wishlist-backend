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
        }
    }
);

module.exports = mongoose.model<IWishlistItem>('WishlistItem', WishlistItemSchema);