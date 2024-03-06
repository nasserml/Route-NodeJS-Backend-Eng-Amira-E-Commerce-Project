import{Router}from'express';
import expressAsyncHandler from'express-async-handler';

import*as orderController from'./order.controller.js';
import{endPointsRoles}from'./order.endpoints.roles.js';
import*as validators from'./order.validationSchemas.js';

import{auth}from'../../middlewares/auth.middleware.js';
import{validationMiddleware}from'../../middlewares/validation.middleware.js';

const router=Router();

router.post('/create-order',validationMiddleware(validators.createOrderSchema),auth(endPointsRoles.CREATE_ORDER),expressAsyncHandler(orderController.createOrderAPI));

router.post('/convert-from-cart-to-order',validationMiddleware(validators.convertFromCartToOrderSchema),auth(endPointsRoles.CONVERT_FROM_CART_TO_ORDER),expressAsyncHandler(orderController.convertFromCartToOrderAPI));
export default router;