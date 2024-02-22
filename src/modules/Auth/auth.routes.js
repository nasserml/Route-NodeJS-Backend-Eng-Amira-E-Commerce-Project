import { Router} from 'express';
import * as authController from './auth.controller.js';
import expressAsyncHandler from 'express-async-handler';
import {validationMiddleware} from '../../middlewares/validation.middleware.js'
import { signUpSchema } from './auth.validationSchemas.js';

const router = Router();

router.post('/sign-up',validationMiddleware(signUpSchema),  expressAsyncHandler(authController.signUpAPI));

router.get('/verfiy-email', expressAsyncHandler(authController.verfiyEmailAPI));

router.post('/login', expressAsyncHandler(authController.signInAPI));

export default router;