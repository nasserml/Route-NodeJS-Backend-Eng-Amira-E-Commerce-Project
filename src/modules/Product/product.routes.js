import { Router } from 'express';
import expressAsyncHandler  from 'express-async-handler';

import * as productController from './product.controller.js';
import { endPointsRoles } from './product.endpoints.roles.js';
import { addProductSchema, updateProductSchema } from './product.validationSchemas.js';

import {validationMiddleware} from '../../middlewares/validation.middleware.js'
import { auth} from '../../middlewares/auth.middleware.js';
import {multerMiddleHost} from '../../middlewares/multer.middleware.js'

import { allowedExtensions } from '../../utils/allowedExtensions.js';


const router = Router();

router.post('/add-product',validationMiddleware(addProductSchema), auth(endPointsRoles.ADD_PRODUCT), multerMiddleHost({extensions:allowedExtensions.image}).array('image', 3), expressAsyncHandler(productController.addProductAPI));

router.put('/update-product/:productId', validationMiddleware(updateProductSchema),auth(endPointsRoles.UPDATE_PRODUCT), multerMiddleHost({extensions: allowedExtensions.image }).single('image'), expressAsyncHandler(productController.updateProductAPI) );

router.get('/get-all-products', expressAsyncHandler(productController.getAllProductsAPI));

router.post('/add-product-socketIO-test',expressAsyncHandler(productController.addProductUsingSocketIOTestAPI));

router.get('/get-all-products-socketIO-test', expressAsyncHandler(productController.getAllProductUsingSocketIOTestAPI));

export default router;