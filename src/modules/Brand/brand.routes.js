import {Router} from 'express';
import expressAsyncHandler from 'express-async-handler';

import * as brandController from './brand.controller.js';
import {endPointsRoles} from './brand.endpoints.roles.js';
import { addBrandSchema, deleteBrandSchema, getAllBrandsForCategorySchema, getAllBrandsForSubcategorySchema, updateBrandSchema } from './brand.validationSchemas.js';


import { multerMiddleHost} from '../../middlewares/multer.middleware.js';
import {validationMiddleware} from '../../middlewares/validation.middleware.js';
import {auth} from '../../middlewares/auth.middleware.js';

import { allowedExtensions } from '../../utils/allowedExtensions.js';

const router = Router();

router.post('/add-brand', validationMiddleware(addBrandSchema),auth(endPointsRoles.ADD_BRAND), multerMiddleHost({extensions: allowedExtensions.image}).single('image'), expressAsyncHandler(brandController.addBrandAPI));

router.delete('/delete-brand/:brandId', validationMiddleware(deleteBrandSchema), auth(endPointsRoles.DELETE_BRND), expressAsyncHandler(brandController.deleteBrandAPI) );

router.put('/update-brand/:brandId', validationMiddleware(updateBrandSchema), auth(endPointsRoles.UPDATE_BRAND),multerMiddleHost({extensions: allowedExtensions.image}).single('image'), expressAsyncHandler(brandController.updateBrandAPI) );

router.get('/get-all-brands', expressAsyncHandler(brandController.getAllBrandsAPI));

router.get('/get-all-brands-for-subcategory/:subCategoryId',validationMiddleware(getAllBrandsForSubcategorySchema),expressAsyncHandler(brandController.getAllBrandsForSubCategoryAPI));

router.get('/get-all-brands-for-category/:categoryId',validationMiddleware(getAllBrandsForCategorySchema),expressAsyncHandler(brandController.getAllBrandsForCategoryAPI))

router.get('/get-all-brands-api-features',expressAsyncHandler(brandController.getBrandsUsingAPIFeaturesAPI))
export default router;
