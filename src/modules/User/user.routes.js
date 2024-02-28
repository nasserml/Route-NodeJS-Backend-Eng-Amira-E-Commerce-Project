import {Router} from 'express';
import expressAsyncHandler from 'express-async-handler';

import * as userController from './user.controller.js'
import { endPointsRoles } from './user.endpoints.roles.js';
import {updateUserSchema, getUserProfileDataSchema} from './user.validationSchemas.js';

import { multerMiddleHost } from '../../middlewares/multer.middleware.js';
import { validationMiddleware } from '../../middlewares/validation.middleware.js';
import { auth } from '../../middlewares/auth.middleware.js';

import { allowedExtensions } from '../../utils/allowedExtensions.js';

const router = Router();

router.put('/update-user', validationMiddleware(updateUserSchema), auth(endPointsRoles.UPDATE_USER), expressAsyncHandler(userController.updateUserAPI));

router.delete('/delete-user', auth(endPointsRoles.DELETE_USER), expressAsyncHandler(userController.deleteUserAPI));

router.get('/get-user-profile-data/:userId', validationMiddleware(getUserProfileDataSchema),auth(endPointsRoles.GET_USER_PROFILE_DATA), expressAsyncHandler(userController.getUserProfileDataAPI));


export default router;
