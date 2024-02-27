import SubCategory from '../../../DB/models/sub-category.model.js';
import Category from '../../../DB/models/category.model.js';
import generateUniqueString from '../../utils/generate-Unique-String.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
import slugify from 'slugify';
import { createDocumnetByCreate, findDocumentByFindById, findDocumentByFindOne } from '../../../DB/dbMethods.js';

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