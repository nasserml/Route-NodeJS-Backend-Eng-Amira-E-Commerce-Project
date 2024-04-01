import {Router} from 'express';
import expressAsyncHandler from 'express-async-handler';

import * as reviewController from './review.controller.js';
import {endPointsRoles} from './review.endpoints.roles.js';
import * as validators from './review.validationSchemas.js'

import {validationMiddleware} from '../../middlewares/validation.middleware.js';
import {auth} from '../../middlewares/auth.middleware.js';

const router=Router();

router.post('/add-review',validationMiddleware(validators.addReviewSchema),auth(endPointsRoles.ADD_REVIEW),expressAsyncHandler(reviewController.addReviewAPI));

export default router;