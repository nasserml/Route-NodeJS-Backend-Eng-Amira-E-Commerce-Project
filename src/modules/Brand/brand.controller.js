import slugify from 'slugify';

import Brand from '../../../DB/models/brand.model.js';
import SubCategory from '../../../DB/models/sub-category.model.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
import generateUniqueString from '../../utils/generate-Unique-String.js';
import {createDocumnetByCreate, findDocumentByFindOne} from '../../../DB/dbMethods.js';
// ================ Add Brand API =======================
/**
 * Add Brand API endpoint to the data base and save image to the cloudinary
 * 
 * @param {import('express').Request} req - Express request object. 
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * 
 * @returns  {import('express').Response} JSON response - Returns success response that the brand is added.
 * 
 * @throws {Error} If the subcategory not found.
 * @throws {Error} If the brand already exists.
 * @throws {Error} If the category is not found.
 * @throws {Error} If the image is not sent.
 * @throws {Error} If the brand is not created in the database.
 */
export const addBrandAPI = async (req, res, next) => {

    // 1- Destructuring the name from the request body
    const {name} =  req.body;
    
    // 2- Destructuring the categoryId and subCategoryId from the request query
    const { categoryId, subCategoryId} = req.query;
    
    // 3- Destructuring the id for the user from request auth user
    const {_id} = req.authUser;

    // 4- Checkif the subcategory exists 
    const subCategoryCheck = await SubCategory.findById(subCategoryId).populate('categoryId', 'folderId');

    // 5- If it is not existss than return an error indicating that the subcategory not found 
    if(!subCategoryCheck) return next({message: 'SubCategory not found', cause: 404});
    
    // 6- Check if the brand name  with suncategory exists together
    const isBrandExists = await findDocumentByFindOne(Brand, {name, subCategoryId});

    // 7- If it is exists return an error indicating that the brand already exists
    if (isBrandExists.success) return next({ message: 'Brand already exists for this subCategory', cause: 400});

    // 8- Check if the category id is the same as the category id in the subacategory otherwise return an error category not found
    if (categoryId != subCategoryCheck.categoryId._id) return next({ message:'Category not found' , cause: 404 });
    
    // 9- Slugifying the name of the brand
    const slug = slugify(name, '-');

    // 10- Check if the request has a file otherwise return an error indicating that the file is required
    if(!req.file) return next({message: 'Please upload the brand logo', cause: 400});

    // 11- Generate unique folder id for the brand
    const folderId = generateUniqueString(4);

    // 12- Create the folder path for the brand
    const folderPath = `${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}/Brands/${folderId}`;

    // 13- Uplod the image to cloudinary and destruct secure_url and public_id
    const {secure_url, public_id} = await cloudinaryConnection().uploader.upload(req.file.path, {folder: folderPath});

    // 14- Create the brand object
    const brandObject = { name, slug, Image: {secure_url, public_id}, folderId, addedBy: _id, subCategoryId, categoryId};

    // 15- Create the brand
    const newBrand = await createDocumnetByCreate(Brand, brandObject);

    // 16- Sent the  successfull response indicating that the brand is added 
    res.status(newBrand.status).json({success: newBrand.success, message: 'Brand added successfully', data : newBrand});


}