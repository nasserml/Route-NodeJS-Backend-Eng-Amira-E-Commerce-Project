import SubCategory from '../../../DB/models/sub-category.model.js';
import Category from '../../../DB/models/category.model.js';
import Brand from '../../../DB/models/brand.model.js';

import generateUniqueString from '../../utils/generate-Unique-String.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
import slugify from 'slugify';
import { createDocumnetByCreate, deleteDocumentByFindByIdAndDelete, findDocumentByFindById, findDocumentByFindOne } from '../../../DB/dbMethods.js';
import { APIFeatures } from '../../utils/api-features.js';

// ================= Add Subcategory API =================
/**
 * Add Subcategory API endpoint to the data base and save image to the cloudinary
 * 
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * 
 * @returns  {import('express').Response.status().json()} JSON response - Returns success response that the subcategory is added.
 * 
 * @throws {Error} If the subcategory name is already exists.
 * @throws {Error} If the category is not found.
 * @throws {Error} If the image is not sent.
 * @throws {Error} If the subcategory is not created in the database.
 */
export const addSubCategoryAPI = async ( req, res, next) => {

    // 1- Destrufcturingh the name of the subcategoppryu from the drequest body
    const { name} = req.body;

    // 2- Destructuring the categhory id from the request patrams
    const { categoryId } = req.params;

    // 3- Destructuring the ifd of the authuser from request the request authUser
    const {_id} =  req.authUser;

    // 4- Check if thhe the subcategory name is laready exists
    const isNameSubCategoryDuplicated = await findDocumentByFindOne(SubCategory, { name});

    // 5- If it is exiosts then  return an error indicating that tghe subactegory name is already exists
    if (isNameSubCategoryDuplicated.success) return next({ cause: 409, message: 'Subcategory name is already exists'})

    // 6- Check if the category exists
    const category = await findDocumentByFindById(Category, categoryId);

    // 7- /If it s not exists then return an error indicating that the caretegory is not found
    if(!category.isDocumentExists) return next({ cause: 404, message : 'Category not found'});
    
    // 8- Slugifying the name
    const slug = slugify(name, '-');

    // 9- Check if the image is ent if not then return an error indicating that the image is required
    if (!req.file) return next({cause: 400, message: 'Image is required'});

    // 10- Generate a unique folder id
    const folderId = generateUniqueString(4);

    // 11- Create folder path for the image to be uopoaded in cloudinary
    const folderPath = `${process.env.MAIN_FOLDER}/Categories/${category.isDocumentExists.folderId}/SubCategories/${folderId}`;

    // 12- Upload the image to cloudinary and destrucure the secure url and the publica ids 
    const {secure_url, public_id} = await cloudinaryConnection().uploader.upload(req.file.path, { folder: folderPath});

    // 13- Initiate and assign the subcategory object the subcategory object
    const subCategory = {name, slug, Image:{secure_url, public_id}, folderId, addedBy:_id, categoryId};

    // 14- Create the subcategory in the database 
    const subCategoryCreated = await createDocumnetByCreate(SubCategory, subCategory);

    // 15- Return the success reponse indicating that the subcategory is created successfully
    res.status(subCategoryCreated.status).json({ success: subCategoryCreated.success, message: 'subCategory created successfully', data: subCategoryCreated});
}

//=============================== Update subcategory API ============================
/**
 * Update subcategory API endpoint
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response.status().json()} JSON response - Returns success response that the subcategory is updated.
 * 
 * @throws {Error} If the subcategory is not found
 * @throws {Error} If the subcategory name is the same as the exsisting one
 * @throws {Error} If Subcategory name is already exists
 * @throws {Error} If categoryid is the same as the exsisting one
 * @throws {Error} If category is not found
 * @throws {Error} If the image is not sent
 * @throws {Error} If the subcategory is not updated in the database
 * 
 */
export const updateSubCategoryAPI = async (req, res, next) => {

    // 1- Destructuring the name and category id and oldPublicId from the request body
    const {name, categoryId , oldPublicId} = req.body;

    // 2- Destructuring the subcategory id from the request params
    const {subCategoryId} = req.params;

    // 3- Destructuring the _id from the request authUser
    const {_id} = req.authUser;

    // 4- Check if the subcategory is exist by using subCategoryId
    const subCategory = await findDocumentByFindById(SubCategory, subCategoryId);

    // 5- If it is not exists return an error subcategory not found
    if(!subCategory.success) return next({message: 'Subcategory not found', cause:404});

    // 6- Check if the name is sent
    if(name) {

        // 6.1- Check if the name is the same as the exsisting one if it is then return an error
        if (name === subCategory.isDocumentExists.name) return next({cause: 409, message: 'Please enter a different Subcategory name from theexisting one'})

        // 6.2- Check if the name is already exists
        const isNameSubCategoryDuplicated = await findDocumentByFindOne(SubCategory, { name });

        // 6.3- If it is exists then return an error indicating that the subcategory name is already exists
        if (isNameSubCategoryDuplicated.success) return next({ cause: 409, message: 'Subcategory name is already exists' })
        
        // 6.4- Update the name of the subcategory
        subCategory.isDocumentExists.name = name;

        // 6.5- Slugifying the name and update the slug
        subCategory.isDocumentExists.slug = slugify(name, '-');
    }
    
    // 7- Check if the category id is sent
    if(categoryId){

        // 7.1- Check if the category id is the same as the exsisting one if it is then return an error
        if(categoryId.toString === subCategory.isDocumentExists.categoryId.toString()) return next({ cause: 409, message: 'Please enter a different category from the existing one'});
        
        // 7.2- Check if the category is exists
        const category = await findDocumentByFindById(Category, categoryId);

        // 7.3- If it is not exists return an error category not found
        if(!category.success) return next({message: 'Category not found', cause: 404});

        // 7.4- Update the category id of the subcategory
        subCategory.isDocumentExists.categoryId = categoryId;
    }

    // 8- Check oldPuclic id is sent
    if(oldPublicId) {
        
        // 8.1- Chjeck if the image is sent if not then return an error
        if(!req.file) return next({cause: 400, message: 'Image is required'});

        // 8.2- Split the old puclic id 
        const newPublicIdArray = oldPublicId.split(`${subCategory.isDocumentExists.folderId}/`);

        // 8.3- Get the new public id
        const newPublicId = newPublicIdArray[1];

        // 8.4- Get the folder path 
        const folderPath = `${newPublicIdArray[0]}${subCategory.isDocumentExists.folderId}`;

        // 8.5- Upload the image to the cloudinary and destruct the secure url
        const { secure_url} = await cloudinaryConnection().uploader.upload(req.file.path, {folder: folderPath, public_id: newPublicId});
        
        // 8.6- Update the image secure url of the subcategory
        subCategory.isDocumentExists.Image.secure_url = secure_url;
    }

    // 9- Add updated by to the subcategory
    subCategory.isDocumentExists.updatedBy = _id;

    // 10- Save the subcategory in the database
    await subCategory.isDocumentExists.save();

    // 11- Return the success response that the subcategory is updated successfully
    res.status(subCategory.status).json({success: subCategory.success, message: 'Subcategory updated successfully', data: subCategory});

}

// ============================== Delete subcategory API ============================
/**
 * Delete subcategory API endpoint
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response.status().json()} JSON response - Returns success response that the subcategory is deleted successfully
 * 
 * @throws {Error} If the subcategory is not found
 * @throws {Error} If the subcategory is not deleted
 */
export const deleteSubCategoryAPI = async (req, res, next) => {
    
    // 1- Destructuring the subCategory id from the request params
    const {subCategoryId} = req.params;

    // 2- Delete the subcategory from the database 
    const subCategory = await deleteDocumentByFindByIdAndDelete(SubCategory, subCategoryId);

    // 3- If the subcategory or deleted is not found then return an error
    if(!subCategory.success) return next({message: 'Subcategory not found', cause: 404});

    // 4- Delete the related brands
    const brands = await Brand.deleteMany({subCategoryId});

    // 5- If there is no related brands then console log that there is no related brands
    if(brands.deletedCount <= 0) console.log('There is no related brands');

    // 6- Create the folder path to be deleted from the cloudinary
    const folderPath = subCategory.isDocumentExists.Image.public_id.split('/').slice(0, -1).join('/');

    console.log({folderPath});

    // 7- Delete the image folderr from the cloudinary and its resources 
    await cloudinaryConnection().api.delete_resources_by_prefix(folderPath);

    // 8- Delete the folder from the cloudinary
    await cloudinaryConnection().api.delete_folder(folderPath);

    // 9- Return the success response that the subcategory is deleted successfully
    res.status(subCategoryId.status).json({success: subCategory.success, message: 'sub category deleted successfully', data: subCategory});
}

// ============================= Get all subcategories with brands API ============================
/**
 * Get all subcategories with brands API endpoint
 * 
 * @param {import('express').Request} req  - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response.status().json()} JSON response - Returns success response with subcategories with brands
 */
export const getAllSubcategoriesWithBrandsAPI = async (req, res, next) => {

    // 1- Find all subcategories with brands
    const subcategories = await SubCategory.find().populate([{path:'Brands'}]);

    // 2- Return the success response with subcategories with brands
    res.status(200).json({success: true, message:'Subcategories with brands fetched successfully',data: subcategories});


}

/**
 * Get all subcategoruies using API features class to filter the result API endpoint
 * 
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Success response wioth the fetchewd filtere subcategories 
 */
export const getAllSubcategoriesAPIFeaturesAPI=async(req,res,next)=>{

    // Extract  the page and size and sort and rest seearch from the request query
    const {page,size,sort,...search}=req.query;

    // Applying Api Features on the subcategorie model to use filter 
    const features=new APIFeatures(req.query,SubCategory.find()).filters(search);

    // Execute the monosoose query on the data base 
    const subCategories=await features.mongooseQuery;

    // send success response with the fetched subcatefgories
    res.status(200).json({message:'Subcategories fetched successfully',subCategories})
}