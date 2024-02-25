import {Router} from 'express';
import * as categoryController from './category.controller.js';
import expressAsyncHandler from 'express-async-handler';
import {multerMiddleHost} from '../../middlewares/multer.middleware.js';
import { endPointsRoles } from './category.endpoints.roles.js';
import {auth} from '../../middlewares/auth.middleware.js';
import { allowedExtensions } from '../../utils/allowedExtensions.js';
import { validationMiddleware } from '../../middlewares/validation.middleware.js';
import { addCategorySchema } from './category.validationSchemas.js';

const router = Router();

router.post('/add-category', auth(endPointsRoles.ADD_CATEGORY),  multerMiddleHost({extensions: allowedExtensions.image}).single('image'), expressAsyncHandler(categoryController.addCategoryAPI));

router.put('/update-category/:categoryId', auth(endPointsRoles.UPDATE_CATEGORY), multerMiddleHost({extensions: allowedExtensions.image}).single('image'), expressAsyncHandler(categoryController.updateCategoryAPI));
export default router;



