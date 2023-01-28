import mongoose, { Schema, Types } from 'mongoose';

export interface IResetPassword extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    token: string;
    createdAt: Date;
    updatedAt: Date;
}

const ResetPasswordSchema: Schema = new Schema({
    _id: {
        type: Types.ObjectId,
        required: true,
        auto: true
    },
    userId: {
        type: Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 1800
    }
});

module.exports = mongoose.model<IResetPassword>('ResetPassword', ResetPasswordSchema);