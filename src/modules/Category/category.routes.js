import {Router} from 'express';
import { createHandler } from 'graphql-http/lib/use/express';

import * as categoryController from './category.controller.js';
import expressAsyncHandler from 'express-async-handler';
import {multerMiddleHost} from '../../middlewares/multer.middleware.js';
import { endPointsRoles } from './category.endpoints.roles.js';
import {auth} from '../../middlewares/auth.middleware.js';
import { allowedExtensions } from '../../utils/allowedExtensions.js';
import { validationMiddleware } from '../../middlewares/validation.middleware.js';
import { addCategorySchema, deleteCategorySchema, getAllSubCategoriesForCategorySchema, getCategoryByIdScema, updateCategorySchema } from './category.validationSchemas.js';
import categorySchema from './graphQL/category.schema.js';

const router = Router();

router.use('/graphql',createHandler({schema:categorySchema}));

router.post('/add-category', auth(endPointsRoles.ADD_CATEGORY),  multerMiddleHost({extensions: allowedExtensions.image}).single('image'), expressAsyncHandler(categoryController.addCategoryAPI));

router.put('/update-category/:categoryId', validationMiddleware(updateCategorySchema),auth(endPointsRoles.UPDATE_CATEGORY), multerMiddleHost({extensions: allowedExtensions.image}).single('image'), expressAsyncHandler(categoryController.updateCategoryAPI));

router.get('/get-all-categories', expressAsyncHandler(categoryController.getAllCategoriesAPI));

router.delete('/delete-category/:categoryId', validationMiddleware(deleteCategorySchema),auth(endPointsRoles.DELETE_CATEGORY), expressAsyncHandler(categoryController.deleteCategoryAPI));

router.get('/get-all-sub-categories-for-category/:categoryId',validationMiddleware(getAllSubCategoriesForCategorySchema),expressAsyncHandler(categoryController.getAllSubcategoriesForSpecificCategoryAPI));

router.get('/get-category-by-id/:categoryId',validationMiddleware(getCategoryByIdScema),expressAsyncHandler(categoryController.getCategoryByIdAPI));

export default router;



