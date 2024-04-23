import { Router} from'express';
import expressAsyncHandler from 'express-async-handler';

import * as couponController from './coupon.controller.js';
import { endpointsRoles } from './coupon.endpoints.roles.js';
import * as validators from './coupon.validationSchemas.js';

import { auth } from '../../middlewares/auth.middleware.js';
import {validationMiddleware } from '../../middlewares/validation.middleware.js';

const router = Router();

router.post('/add-coupon', validationMiddleware( validators.addCouponSchema ), auth( endpointsRoles.ADD_COUPON ) , expressAsyncHandler( couponController.addCouponAPI ) );

router.get('/apply-coupon',validationMiddleware(validators.applyCouponSchema),auth(endpointsRoles.APPLY_COUPON),expressAsyncHandler(couponController.applyCouponAPI));

router.put('/disable-coupon/:couponId',validationMiddleware(validators.disableCouponSchema),auth(endpointsRoles.DISABLE_COUPON),expressAsyncHandler(couponController.disableCouponAPI));

router.put('/enable-coupon/:couponId',validationMiddleware(validators.enableCouponSchema),auth(endpointsRoles.ENABLE_COUPON),expressAsyncHandler(couponController.enableCouponAPI));

export default router;