import mongoose  from 'mongoose';

/**
 * Mongoose schema definition for the product collection in the database
 * 
 * @property {string} title - The title of the product. Must be required and trimmed.
 * @property {string} desc - The description of the product.
 * @property {string} slug - The slug of the product. Must be required and trimmed.
 * @property {string} folderId - The folderId on the cloudinary of the product
 * @property {Number} basePrice - The basePrice of the product. Must be required.
 * @property {Number} discount - The discount of the product. Default is 0.
 * @property {Number} appliedPrice - The appliedPrice of the product. Must be required.
 * @property {Number} stock - The stock of the product. Must be required. Default is 0.
 * @property {Number} rate - The rate of the product. Default is 0. Minimum is 0. Maximum is 5.
 * @property {array<object>} Image - The image of the product object with secure_url and public_id.
 * @property {Map} specs - The specifications of the product
 * @property {mongoose.Schema.Types.ObjectId} addedBy - The ID of the user who added the product.
 * @property {mongoose.Schema.Types.ObjectId} updatedBy - The ID of the user who updated the product.
 * @property {mongoose.Schema.Types.ObjectId} categoryId - The ID of the category of the product
 * @property {mongoose.Schema.Types.ObjectId} subCategoryId - The ID of the subCategory of the product
 * @property {mongoose.Schema.Types.ObjectId} brandId - The ID of the brand of the product 
* @property {Date} createdAt - The date and time when the product was created.
 * @property {Date} updatedAt - The date and time when the product was last updated.
 */
const productSchema = new mongoose.Schema({
    /** string */
    title: { type: String, required: true, trim: true},
    desc: String,
    slug: { type: String, required: true, trim: true},
    folderId: { type: String, required: true, unique: true},
    
    /** Number */
    basePrice: { type: Number, required: true},
    discount: {type: Number, default: 0},
    appliedPrice: { type: Number, required: true},
    stock: { type: Number, required: true, min: 1},
    rate: { type: Number, default:0, min: 0, max:5},

    /** Arrays  */
    Images: [{ secure_url: { type: String, required: true}, public_id:{type: String, required: true, unique: true}}],

    /** Object(Map) */
    specs: { type: Map, of: [String | Number]},

    /* ObjectIds */
    addedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },


},{timestamps: true});


/**
 * Exports the product model to be used 
 */
export default mongoose.models.Product || mongoose.model('Product', productSchema)