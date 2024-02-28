import mongoose from "mongoose";

//======================= Create the brand schema =======================//
/**
 * Mongoose schema definition for the Brand collection in the database
 * 
 * @typedef {mongoose.Schema} brandSchema
 * @property {string} name - The name of the brand. Must be required and trimmed.
 * @property {string} slug - The slug of the brand. Must be required and trimmed.
 * @property {object} Image - The image of the brand object with secure_url and public_id.
 * @property {string} folderId - The folderId on the cloudinary of the brand 
 * @property {mongoose.Schema.Types.ObjectId} addedBy - The ID of the user who added the brand
 * @property {mongoose.Schema.Types.ObjectId} updatedBy - The ID of the user who updated the brand
 * @property {mongoose.Schema.Types.ObjectId} subCategoryId - The ID of the subCategory of the brand
 * @property {mongoose.Schema.Types.ObjectId} categoryId - The ID of the category of the brand
 * @property {Date} createdAt - The date and time when the brand was created.
 * @property {Date} updatedAt - The date and time when the brand was last updated.
 */
const brandSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true},
    slug: { type:String, required: true, trim: true},
    Image: {secure_url: {type: String,required: true } , public_id: {type: String, required: true, unique: true}},
    folderId: { type: String, required: true, unique:true},
    addedBy: { type:mongoose.Schema.Types.ObjectId, ref:'User', required: true},
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    subCategoryId : {type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true},
    categoryId: {type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true}
}, {timestamps: true,toJSON:{virtuals: true}, toObject:{virtuals: true}   });

brandSchema.virtual('Products', {ref: 'Product', localField: '_id', foreignField: 'brandId'});

/**
 * Exports the brand model to be used 
 */
export default mongoose.models.Brand || mongoose.model('Brand', brandSchema)