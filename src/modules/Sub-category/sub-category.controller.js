import SubCategory from '../../../DB/models/sub-category.model.js';
import Category from '../../../DB/models/category.model.js';
import generateUniqueString from '../../utils/generate-Unique-String.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
import slugify from 'slugify';
import { createDocumnetByCreate, findDocumentByFindById, findDocumentByFindOne } from '../../../DB/dbMethods.js';

// ================= Add Subcategory API =================

export const addSubCategoryAPI = async ( req, res, next) => {

    const { name} = req.body;

    const { categoryId } = req.params;

    const {_id} =  req.authUser;

    const isNameSubCategoryDuplicated = await findDocumentByFindOne(SubCategory, { name});

    if (isNameSubCategoryDuplicated.success) return next({ cause: 409, message: 'Subcategory name is already exists'})

    const category = await findDocumentByFindById(Category, categoryId);

    if(!category.isDocumentExists) return next({ cause: 404, message : 'Category not found'});
    
    const slug = slugify(name, '-');

    if (!req.file) return next({cause: 400, message: 'Image is required'});

    const folderId = generateUniqueString(4);

    const folderPath = `${process.env.MAIN_FOLDER}/Categories/${category.isDocumentExists.folderId}/SubCategories/${folderId}`;

    const {secure_url, public_id} = await cloudinaryConnection().uploader.upload(req.file.path, { folder: folderPath});

    const subCategory = {name, slug, Image:{secure_url, public_id}, folderId, addedBy:_id, categoryId};

    const subCategoryCreated = await createDocumnetByCreate(SubCategory, subCategory);

    res.status(subCategoryCreated.status).json({ success: subCategoryCreated.success, message: 'subCategory created successfully', data: subCategoryCreated})

}