import {Router} from 'express';
import expressAsyncHandler from 'express-async-handler';

import * as brandController from './brand.controller.js';
import {endPointsRoles} from './brand.endpoints.roles.js';
import { addBrandSchema } from './brand.validationSchemas.js';


import { multerMiddleHost} from '../../middlewares/multer.middleware.js';
import {validationMiddleware} from '../../middlewares/validation.middleware.js';
import {auth} from '../../middlewares/auth.middleware.js';

import { allowedExtensions } from '../../utils/allowedExtensions.js';

const router = Router();

router.post('/add-brand', validationMiddleware(addBrandSchema),auth(endPointsRoles.ADD_BRAND), multerMiddleHost({extensions: allowedExtensions.image}).single('image'), expressAsyncHandler(brandController.addBrandAPI));

export default router;
