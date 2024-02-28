import slugify from 'slugify';

import Brand from '../../../DB/models/brand.model.js';
import SubCategory from '../../../DB/models/sub-category.model.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
import generateUniqueString from '../../utils/generate-Unique-String.js';
import {createDocumnetByCreate, deleteDocumentByFindByIdAndDelete, findDocumentByFindById, findDocumentByFindOne} from '../../../DB/dbMethods.js';
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

// ================ delete Brand API =======================
/**
 * Delete Brand API endpoint to the data base and delete image from the cloudinary
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns  {import('express').Response} JSON response - Returns success response that the brand is deleted
 * 
 * @throws {Error} If the brand not found
 * @throws {Error} If the brand is not deleted
 */
export const deleteBrandAPI = async (req, res, next) => {

    // 1- Destructuring the brandId from the request params
    const {brandId} = req.params;

    // 2- Delete the brand
    const brand = await deleteDocumentByFindByIdAndDelete(Brand, brandId);

    // 3- If the brand or deleted is not found then return an error
    if(!brand.success) return next({message: 'Brand not found', cause: 404});

    // 4- Create folder path for the image to delete
    const folderPath = brand.deleteDocument.Image.public_id.split('/').slice(0, -1).join('/');

    // 5- Delete the image from the cloudinary
    await cloudinaryConnection().api.delete_resources_by_prefix(folderPath);

    // 6- Delete the folder from the cloudinary
    await cloudinaryConnection().api.delete_folder(folderPath);

    // 7- Sent the  successfull response indicating that the brand is deleted
    res.status(brand.status).json({success: brand.success, message: 'Brand deleted successfully', data: brand});
}

// ================ update Brand API =======================
/**
 * Update Brand API endpoint 
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns  {import('express').Response} JSON response - Returns success response that the brand is updated
 * 
 * @throws {Error} If the brand not found
 * @throws {Error} If the brand name already exists
 * @throws {Error} If the category not found
 * @throws {Error} If the subcategory not found
 * @throws {Error} If the old public id is not the same as existing public id
 * @throws {Error} If the image is not sent
 * @throws {Error} If the brand is not updated
 */
export const updateBrandAPI = async (req, res, next) => {

    // 1- Destructuring the name, categoryId, subCategoryId, oldPublicId from the request body
    const {name, categoryId, subCategoryId, oldPublicId} = req.body;

    // 2- Destructuring the brandId from the request params
    const {brandId} = req.params;

    // 3- Destructuring the id for the user from request auth user
    const {_id} = req.authUser;

    // 4- Find the brand
    const brand = await findDocumentByFindOne(Brand, {_id: brandId, addedBy: _id});


    // 5- If the brand is not  found or not addedby the auth user  then return an error
    if(!brand.success) return next({message: 'Brand not found', cause: 404});

    // 6- Check if the name is sent
    if(name) {

        // 6.1- Check if the name is not the same as existing name if is the same then return an error
        if(name == brand.isDocumentExists.name) return next({message: 'Please enter different name from the existing one', cause: 400});

        // 6.2- Check if the name is duplicated
        const isNameBrandDuplicated = await findDocumentByFindOne(Brand, {name});

        // 6.3- If the name is duplicated then return an error
        if(isNameBrandDuplicated.success) return next({message: 'Brand name already exists', cause: 400});

        // 6.4- Update the name
        brand.isDocumentExists.name = name;

        // 6.5- Slugifying the name and updated it
        brand.isDocumentExists.slug = slugify(name, '-');
    }

    // 7- Check if the categoryId is sent
    if(categoryId) {

        // 7.1- Check if the categoryId is not the same as existing categoryId if is the same then return an error
        if(categoryId.toString() === brand.isDocumentExists.categoryId.toString()) return next({message: 'Please enter different category from the existing one', cause: 400});

        // 7.2- Check if the categoryId is duplicated
        const category = await findDocumentByFindById(Category, categoryId);

        // 7.3- If the categoryId is duplicated then return an error
        if(!category.success) return next({message: 'Category not found', cause: 404});

        // 7.4- Update the categoryId
        brand.isDocumentExists.categoryId = categoryId;
    }

    // 8- Check if the subCategoryId is sent
    if(subCategoryId) {

        // 8.1- Check if the subCategoryId is not the same as existing subCategoryId if is the same then return an error
        if(subCategoryId.toString() === brand.isDocumentExists.subCategoryId.toString()) return next({message: 'Please enter different subcategory from the existing one', cause: 400});

        // 8.2- Check if the subCategoryId is duplicated
        const subCategory = await findDocumentByFindById(SubCategory, subCategoryId);

        // 8.3- If the subCategoryId is duplicated then return an error
        if(!subCategory.success) return next({message: 'SubCategory not found', cause: 404});
        
        // 8.4- Update the subCategoryId
        brand.isDocumentExists.subCategoryId = subCategoryId;
    }

    // 9- Check if the oldPublicId is sent
    if(oldPublicId) {

        // 9.1- Make sure that the oldPublicid is the same as he existing one in the document if not return an error
        if (oldPublicId !== brand.isDocumentExists.Image.public_id) return next({message: 'Please enteer the correct oldpublicid', cause: 400});

        // 9.2- Check if the image is sent if not return an error
        if(!req.file) return next({message: 'Image is required', cause: 400});

        // 9.3- Split the old public id to get folder path and name of the image to overwrite it
        const newPublicIdArray = oldPublicId.split(`${brand.isDocumentExists.folderId}/`);

        // 9.4- Get the new public id as image name
        const newPublicId = newPublicIdArray[1];

        // 9.5- Get the folder path
        const folderPath = `${newPublicIdArray[0]}${brand.isDocumentExists.folderId}`;

        // 9.6- Upload the image to cloudinary and destruct the secure url
        const {secure_url} = await cloudinaryConnection().uploader.upload(req.file.path, {folder: folderPath, public_id: newPublicId});

        // 9.7- Update the secure url of the image 
        brand.isDocumentExists.Image.secure_url = secure_url;
    }

    // 10- Update the brand updatedBy 
    brand.isDocumentExists.updatedBy = _id;

    // 11- Save the brand in the database
    await brand.isDocumentExists.save();

    // 12- Return the success response that the brand is updated successfully with the brand
    res.status(brand.status).json({message: 'Brand updated successfully', success: brand.success, data: brand});
}

// ================ Get All Brands API =======================
/**
 * Get all brands API endpoint
 * 
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * 
 * @returns {import('express').Response} JSON response - Returns success response that the brands are fetched successfully.
 */
export const getAllBrandsAPI = async (req, res, next) => {
    
    // 1- Get all brands from the database and populate the products
    const brands = await Brand.find().populate([{path: 'Products'}])

    // 2- Return the success response that the brands with products are fetched successfully
    res.status(200).json({success: true, message: 'Brands with products fetched successfully',data: brands})
}