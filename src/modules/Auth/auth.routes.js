import { Router} from 'express';
import * as authController from './auth.controller.js';
import expressAsyncHandler from 'express-async-handler';

const router = Router();

router.post('/sign-up', expressAsyncHandler(authController.signUpAPI));

router.get('/verfiy-email', expressAsyncHandler(authController.verfiyEmailAPI));

router.post('/login', expressAsyncHandler(authController.signInAPI));

export default router;