import { required } from 'joi';
import mongoose from 'mongoose';

const couponUsersSchema = new mongoose.Schema({
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    maxUsage: { type: Number, required: true, min: 1 },
    usageCount: { type: Number, default: 0, required: true},
},{timestamps: true});


export default mongoose.models.CouponUsers || mongoose.model('CouponUsers', couponUsersSchema);