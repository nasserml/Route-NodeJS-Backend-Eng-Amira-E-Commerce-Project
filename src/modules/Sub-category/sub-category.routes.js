import { Router } from 'express';

import * as subCategoryController from './sub-category.controller.js';
import expressAsyncHandler from 'express-async-handler';
import {validationMiddleware} from '../../middlewares/validation.middleware.js'
import { multerMiddleHost} from '../../middlewares/multer.middleware.js';
import { endPointsRoles } from './sub-category.endpoints.roles.js';
import {auth} from '../../middlewares/auth.middleware.js';
import { allowedExtensions } from '../../utils/allowedExtensions.js';
import { addSubCategorySchema } from './sub-category.validationSchemas.js';
const router = Router();

router.post('/add-sub-category/:categoryId', validationMiddleware(addSubCategorySchema),auth(endPointsRoles.ADD_SUB_CATEGORY), multerMiddleHost({extensions: allowedExtensions.image}).single('image'), expressAsyncHandler(subCategoryController.addSubCategoryAPI));

export default router;