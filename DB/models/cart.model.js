import mongoose from 'mongoose';

/**
 * Mongoose schema definition for the cart collection in the database
 * 
 * @typedef {mongoose.Schema} cartSchema
 * @property {mongoose.Schema.Types.ObjectId} userId - The ID of the user who added the cart
 * @property {array<object>} products - The products in the cart with productId, quantity, basePrice, finalPrice, title
 * @property {number} subTotal - The subTotal of the cart
 * @property {Date} createdAt - The date and time when the cart was created.
 * @property {Date} updatedAt - The date and time when the cart was last updated.
 */
const cartSchema = new mongoose.Schema({
    userId: {type:mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    products : [{productId:{type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true}, quantity:{type: Number, required: true, default: 1}, basePrice:{ type: Number, required: true, default:1}, finalPrice:{type: Number, required: true}, title:{type:String, required: true}}],
    subTotal: { type: Number, required: true, default: 0}
},{timestamps: true});

/**
 * Exports the cart model to be used 
 */
export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);