import mongoose from 'mongoose';

/**
 * Mongoose schema definition for the subCategory collection in the database
 * 
 * @typedef {mongoose.Schema} subCategorySchema
 * @property {string} name - The name of the subCategory
 * @property {string} slug - The slug of the subCategory
 * @property {object} Image - The image of the subCategory with secure_url and public_id
 * @property {string} folderId - The folderId on the cloudinary of the subCategory
 * @property {mongoose.Schema.Types.ObjectId} addedBy - The ID of the user who added the subCategory
 * @property {mongoose.Schema.Types.ObjectId} updatedBy - The ID of the user who updated the subCategory
 * @property {mongoose.Schema.Types.ObjectId} categoryId - The ID of the category of the subCategory
 * @property {Date} createdAt - The date and time when the subCategory was created
 * @property {Date} updatedAt - The date and time when the subCategory was last updated
 */
const subCategorySchema = new mongoose.Schema({

    /**String */
    name: { type: String, required: true, unique: true, trim: true},
    slug: { type: String, required: true, unique: true, trim: true },
    Image: {secure_url: { type: String, required: true },public_id: { type: String, required: true, unique: true }},
    folderId: { type: String, required: true, unique: true },

    /** ObjectIds */
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // superAdmin
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // superAdmin
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }

}, {timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}});

// brand virtual populate
subCategorySchema.virtual('Brands', {ref: 'Brand', localField: '_id', foreignField: 'subCategoryId'});

/**
 * Exports the subCategory model to be used
 */
export default mongoose.models.SubCategory || mongoose.model('SubCategory', subCategorySchema)