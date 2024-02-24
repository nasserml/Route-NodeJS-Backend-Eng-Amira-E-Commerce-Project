import slugify from 'slugify';

import Category from '../../../DB/models/category.model.js';
import SubCategory from '../../../DB/models/sub-category.model.js';
import Brand from '../../../DB/models/brand.model.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
import generateUniqueString from '../../utils/generate-Unique-String.js';
import { createDocumnetByCreate, findDocumentByFindOne} from '../../../DB/dbMethods.js';
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