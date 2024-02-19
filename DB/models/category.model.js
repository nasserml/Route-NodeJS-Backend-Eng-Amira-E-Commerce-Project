import mongoose from 'mongoose';

//========================== Create Category Schema =================
/**
 * Mongoose schema definition for the category collection in the database
 * 
 * @property {string} name - The name of the category. Must be required and unique.
 * @property {string} slug - The slug of the category. Must be required and unique.
 * @property {object} Image - The image of the category object with secure_url and public_id.
 * @property {string} folderId - The folderId on the cloudinary of the category
 * @property {mongoose.Schema.Types.ObjectId} addedBy - The ID of the user who added the category. Must be superAdmin.
 * @property {mongoose.Schema.Types.ObjectId} updatedBy - The ID of the user who updated the category. Must be superAdmin.
 * @property {Date} createdAt - The date and time when the category was created.
 * @property {Date} updatedAt - The date and time when the category was last updated.
 */
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    Image: {secure_url: { type: String, required: true },public_id: { type: String, required: true, unique: true }},
    folderId: { type: String, required: true, unique: true },
    addedBy : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // superAdmin
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // superAdmin
},{timestamps: true, toJSON:{virtuals: true}, toObject:{virtuals: true}});

// Virtual populate for subcategories
categorySchema.virtual('subcategories', {ref:'subCategory', localField: '_id', foreignField: 'categoryId'});

/**
 * Exports the category model to be used 
 */
export default mongoose.models.Category || mongoose.model('Category', categorySchema)