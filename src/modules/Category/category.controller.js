import slugify from 'slugify';

import Category from '../../../DB/models/category.model.js';
import SubCategory from '../../../DB/models/sub-category.model.js';
import Brand from '../../../DB/models/brand.model.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
import generateUniqueString from '../../utils/generate-Unique-String.js';
import { createDocumnetByCreate, deleteDocumentByFindByIdAndDelete, findDocumentByFindById, findDocumentByFindOne} from '../../../DB/dbMethods.js';
// ==================== Add Category API ==============
/**
 * Add new category to the database eendpoin API.
 * 
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * 
 * @returns {import('express').Response} JSON response - Returns success response that the category is added.
 * 
 * @throws {Error} If the category name is already exists.
 * @throws {Error} If the image is not sent.
 * @throws {Error} If the category is not created in the database.
 */
export const addCategoryAPI = async (req, res, next) => {

    // 1- Destructuring the request body
    const { name } = req.body;

    // 1.1- Destructuring _id the authUser from the request
    const {_id} = req.authUser;

    // 2- Check if the category name is already exists in the database
    const isNameCategoryNameDuplicated = await findDocumentByFindOne(Category, { name});

    // 2.1 If it is exists return error name is already exists
    if (isNameCategoryNameDuplicated.success) return next({cause: 409, message: 'Category name is already exists'});

    // 3- Generate the slug
    const slug = slugify(name, '-');

    // 4- Upload image to cloudinary 
    // 4.1- Check if the image is sent in the request otherwise return error
    if (!req.file) return next({cause: 409, message:'Image is required'});

    // 4.2- Generate unique folder id for the category
    const folderId = generateUniqueString(4);
    const folderPath = `${process.env.MAIN_FOLDER}/Categories/${folderId}`;

    // 4.3- Upload the image top cloudinary and destructure the secure url and the public id for the image
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {folder: folderPath});

    // 4.4- Add folerPath to folder in the request
    req.folder = folderPath;

    // 5- Generate the category object
    const category = {name, slug, Image: { secure_url, public_id}, folderId, addedBy: _id };

    // 6- Creat the category 
    const categoryCreated = await createDocumnetByCreate(Category, category);

    // 7- Add category model and category id to savedDocuments in the request
    req.savedDocuments = {model: Category, _id: categoryCreated._id};

    // 8- Send the response indicating the success of creating the category
    res.status(categoryCreated.status).json({success: categoryCreated.success, message: 'Categhory  created successfully', data: categoryCreated});

}


//=============================== Update category API ============================
/**
 * Update category API endpoint
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Returns success response that the category is updated successfully.
 * 
 * @throws {Error} If the category name is the same as the exsisting one
 * @throws {Error} If Category name is already exists
 * @throws {Error} If the category not updated in the database
 */
export const updateCategoryAPI = async (req, res, next) => {

    // 1- Destructuring the name and the oldPublicId from tyhe request body
    const {name, oldPublicId} = req.body;

    // 2- Destructuring the category id from the request params
    const {categoryId} = req.params;

    // 3- Destructuring the _id from the request authUser
    const {_id }= req.authUser;

    // 4- Check if the category is exist by using categoryId
    const category = await findDocumentByFindById(Category, categoryId);

    // 4.1- If it is not exists return an error category not found 
    if(!category.success) return next({message:'Category not found', cause :404});

    // 5- Check if the user want to update the name field
    if(name) {

        // 5.1- Check if the new category name is different from the old one if it is not return an error wiht message please enter different category name
        if(name === category.isDocumentExists.name) return next({ cause: 404, message: 'Please enter different category name from the existing one'});
        
        // 5.2- Check if new category name is already exists 
        const isNameCategoryDuplicated = await findDocumentByFindOne(Category, { name});

        // 5.3- If it is exists return an error with meassage category name is already exisits
        if(isNameCategoryDuplicated.success) return next ({cause: 409, message: 'Category name is already exists'});

        // 5.4- Update the category name
        category.isDocumentExists.name = name;

        // 5.5- update the category slug by slugfing the name
        category.isDocumentExists.slug = slugify(name, '-')

    }

    // 6- mCheck if the user want to update the image
    if (oldPublicId) {

        // 6.1- check if the image was sent to the request other wise return an error with image required
        if (!req.file) return next({cause: 400, message: 'Image is required'});

        // 6.2- Split the old public id to get the image file name so that we can overwrite it
        const newPublicId = oldPublicId.split(`${category.isDocumentExists.folderId}/`)[1];

        // 6.3- Generate folder path for secure url
        const folderPath = `${process.env.MAIN_FOLDER}/Categories/${category.isDocumentExists.folderId}`;

        // 6.4- Uploda the image to cloudinary and overwrite the existing one and destrucing the secureurl for the new one 
        const {secure_url} = await cloudinaryConnection().uploader.upload(req.file.path, {folder: folderPath, public_id: newPublicId});

        // 6.5- Update the old secure url to the new one
        category.isDocumentExists.Image.secure_url = secure_url;

    }

    // 7- Addd field to the category indicating that the one who updated the category
    category.isDocumentExists.updatedBy = _id;

    // 8- Save the updated category in the database
    await category.isDocumentExists.save();
    
    // 9- Send successfull response indicating that the category updated successfully
    res.status(category.status).json({success: category.success, message: 'Category updated successfully', data: category});
}


// ====================== Get all categories API =====================
/**
 * Get all Categories API endpoint from the data base with subcategories and populate subcategories with brands as nested populate
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Returns success response that the categories are fetched successfully
 */
export const getAllCategoriesAPI = async (req, res, next) => {

    // Nested populate to get all categories in the database and populate subCategories field with subcategories, and Brand for each subCategory
    const categories = await Category.find().populate([{path: 'subcategories', populate:[{path: 'Brands'}]}]);

    // Send successful response with status 200 and send a JSON response with a success messga e with categories
    res.status(200).json({ success: true, message: 'Categories fetched successfully', data: categories});
}

// ================= Delete Category API ====================
/**
 * Delete category API endpoint and delete all resources from the cloud cloudinary and the data base
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function\
 * 
 * @returns {import('express').Response} JSON response - Returns success response that the category is deleted
 * 
 * @throws {Error} If the category was not found
 * @throws {Error} If the category was not deleted
 */
export const deleteCategoryAPI = async (req, res, next) => {

    // 1- Destructuting the categoryId fromthe request params
    const { categoryId} = req.params;

    // 2- Find and delete the category from the database using the category id
    const category = await deleteDocumentByFindByIdAndDelete(Category, categoryId);

    // 3-  Check if the category was found if it is not return error that category was  not found 
    if (!category.success) return next({ cause: 404, message: 'Category not found'});

    // 4- Delete all the subcategory related to this category
    const subCategories = await SubCategory.deleteMany({categoryId});

    // 5- Check if there were any subcateries if it was not console log that there were no subcategory
    if (subCategories.deletedCount <= 0 ) console.log('There is no related subcategories');

    // 6- Delete all the brands related to this category from the data base
    const brands = await Brand.deleteMany({categoryId});

    // 7- Check if there were any related brands deletedf from the database if there were not then console log that there were no brands for this category
    if (brands.deletedCount <= 0 ) console.log('There is no related brands');

    // 8- Get the folder path fo tr the category in the cloyud
    const folderPath = `${process.env.MAIN_FOLDER}/Categories/${category.deleteDocument.folderId}`;

    // 9- Delete all the resources and the folder in the category from cloudinatry cloud storage
    await cloudinaryConnection().api.delete_resources_by_prefix(folderPath);
    await cloudinaryConnection().api.delete_folder(folderPath);

    // 10- Send successfully response indicating that the category was deleted successfully
    res.status(200).json({success: true, message: 'Category deleted successfully'});
}

/**
 * Get the category with its subcategories using category id API endpoint
 * 
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Success response with the specified category with its subcategories
 */
export const getAllSubcategoriesForSpecificCategoryAPI=async(req,res,next)=>{

    // Extract the category id from the request parameters
    const {categoryId}=req.params;

    // Get the categort with its subcategories using find by id and populate the subcategories field
    const caretegoryWithSubCategories=await Category.findById(categoryId).populate([{path:'subcategories'}]);

    // Send success response with the category with its subcategories
    res.status(200).json({message:'Subcategories for specififc category fetched successfully',data:caretegoryWithSubCategories});
}

/**
 * Get category by its id API endpoint
 * 
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Success response with the foun category
 * 
 * @throws {Error} If the category not found in the database 
 */
export const getCategoryByIdAPI=async(req,res,next)=>{

    // Extract the category id from the request parameters
    const {categoryId}=req.params;

    // Get the category using the find by id method
    const category=await findDocumentByFindById(Category,categoryId);

    // If the category is not found retiurn an error
    if(!category.success) return next({cause:404,message:'Category not found'});

    // Send success response that  the category found successfully with the data
    res.status(category.status).json({message:'Category found successfully',data:category.isDocumentExists});

}