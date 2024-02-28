import { Router } from 'express';

import * as subCategoryController from './sub-category.controller.js';
import expressAsyncHandler from 'express-async-handler';
import {validationMiddleware} from '../../middlewares/validation.middleware.js'
import { multerMiddleHost} from '../../middlewares/multer.middleware.js';
import { endPointsRoles } from './sub-category.endpoints.roles.js';
import {auth} from '../../middlewares/auth.middleware.js';
import { allowedExtensions } from '../../utils/allowedExtensions.js';
import { addSubCategorySchema, updateSubCategorySchema, deleteSubCategorySchema } from './sub-category.validationSchemas.js';
const router = Router();

router.post('/add-sub-category/:categoryId', validationMiddleware(addSubCategorySchema),auth(endPointsRoles.ADD_SUB_CATEGORY), multerMiddleHost({extensions: allowedExtensions.image}).single('image'), expressAsyncHandler(subCategoryController.addSubCategoryAPI));

router.put('/update-sub-category/:subCategoryId', validationMiddleware(updateSubCategorySchema), auth(endPointsRoles.UPDATE_SUB_CATEGORY),multerMiddleHost({extensions: allowedExtensions.image}).single('image'), expressAsyncHandler(subCategoryController.updateSubCategoryAPI))

router.delete('/delete-sub-category/:subCategoryId', validationMiddleware(deleteSubCategorySchema), auth(endPointsRoles.DELETE_SUB_CATEGORY), expressAsyncHandler(subCategoryController.deleteSubCategoryAPI));

router.get('/get-all-sub-categories-with-brands', expressAsyncHandler(subCategoryController.getAllSubcategoriesWithBrandsAPI));

export default router;