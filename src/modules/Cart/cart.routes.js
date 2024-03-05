import { Router} from 'express';
import expressAsyncHandler from 'express-async-handler';

import * as cartController from './cart.controller.js';
import { addProductToCartSchema, removeProductFromCartSchema } from './cart.validationSchemas.js';
import { endPointsRoles } from './cart.endpoints.roles.js';


import {auth} from '../../middlewares/auth.middleware.js';
import {validationMiddleware} from '../../middlewares/validation.middleware.js'

import { systemRoles } from '../../utils/systemRoles.js';

const router = Router();

router.post('/add-product-to-cart', validationMiddleware(addProductToCartSchema),auth(endPointsRoles.ADD_PRODUCT_TO_CART), expressAsyncHandler(cartController.addProductToCartAPI) );

router.put('/remove-product-from-cart/:productId', validationMiddleware(removeProductFromCartSchema), auth(endPointsRoles.REMOVE_PRODUCT_FROM_CART), expressAsyncHandler(cartController.removeProductFromCartAPI));

export default router;