import { Router} from 'express';
import * as authController from './auth.controller.js';
import expressAsyncHandler from 'express-async-handler';
import {validationMiddleware} from '../../middlewares/validation.middleware.js'
import { signUpSchema , loginSchema, forgetPasswordSchema, resetPasswordSchema, loginWithGmailSchema, signUpWithGmailSchema} from './auth.validationSchemas.js';
import { auth } from '../../middlewares/auth.middleware.js';
import {endPointsRoles} from './auth.endpoints.roles.js';
const router = Router();

router.post('/sign-up',validationMiddleware(signUpSchema),  expressAsyncHandler(authController.signUpAPI));

router.get('/verfiy-email', expressAsyncHandler(authController.verfiyEmailAPI));

router.post('/login', validationMiddleware(loginSchema), expressAsyncHandler(authController.signInAPI));

router.post('/forget-password',validationMiddleware(forgetPasswordSchema),expressAsyncHandler(authController.forgetPasswordAPI));

router.post('/reset-password/:token', validationMiddleware(resetPasswordSchema),expressAsyncHandler(authController.resetPasswordAPI));

router.post('/loginWithGmail',validationMiddleware(loginWithGmailSchema),expressAsyncHandler(authController.loginWithGmailAPI));

router.post('/signUpWithGmail',validationMiddleware(signUpWithGmailSchema),expressAsyncHandler(authController.signUpWithGmailAPI));

router.patch('/soft-delete-user',auth(endPointsRoles.SOFT_DELETE_USER),expressAsyncHandler(authController.softDeleteUserAPI));

export default router;