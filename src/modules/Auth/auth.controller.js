import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../../../DB/models/user.model.js';
import sendEmailService from '../../services/send-email.service.js';
import { createDocumnetByCreate, findDocumentByFindOne, updateDocumentByFindOneAndUpdate } from '../../../DB/dbMethods.js';

// ========================== SignUp APi ====================

/**
 * destructuring the required date from the request body
 * check if the user already exists in the database using the email
 * iif exists return error email is already exists
 * password hashing
 * create new account in the database
 * return the response
 */
/**
 * Sign up API endpoint for creating a new user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Returns success response with thhe new user data
 * 
 * @throws {Error} If email is already exists 
 * @throws {Error} If email is not sent
 * @throws {Error} If the user is not created in the database
 */
export const signUpAPI =async (req, res, next) => {
     // 1- destructure the required data from the request body
     const {username, email, password, age, role, phoneNumbers, addresses} = req.body;

     // 2- check if the user already exists in the database using the email
     const isEmailDuplicated = await findDocumentByFindOne(User, {email});

     if (isEmailDuplicated.success) return next(new Error('Email already exists, Please try another email', {cause: 409}));

     // generate verfication token for the user's email
     const userToken = jwt.sign({email}, process.env.JWT_SECRET_VERFICATION, { expiresIn: '2m'});

     // 3- send a confirmation email to the user
     const isEmailSent = await sendEmailService({to: email, subject: 'Email Verification', message: `<h2>please click on this link to verfiy your email</h2><a href="${req.protocol}://${req.headers.host}/auth/verfiy-email?token=${userToken}">Verfiy Email</a>`});

     // 4- check if the email is sent suiccessfully
     if(!isEmailSent) return next(new Error('Email is not sent please try again later', { cause: 500}));

     // 5- password hashing 
     const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);

     // 6- create new document in the database
     const newUser = await createDocumnetByCreate(User, {username, email, password: hashedPassword, age, role, phoneNumbers, addresses});

     // Check if the user is created in the database otherwise return an error
     if (!newUser.success) return next(new Error('User not created', {cause: 500}));

     // 7- return the response
     res.status(newUser.status).json({success: newUser.success, message: 'User created successfully, Please check your email to verfiy your account', data: newUser});
}

// ======================== verfiy Email API =====================
/**
 * destructuring the token from the request query 
 * verfiy the token 
 * get user by email, isEmailVerfied = false
 * if not return error user not found
 * if founnd 
 * update isEmailVerfied = true
 * return response
 */
/**
 * Verfiy email API endpoint using the provided token
 * 
 * @param {import('express').Request} req  - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns  {import('express').Response} JSON response - Returns success response that the email is verfied
 * 
 * @throws {Error} If user not found
 */
export const verfiyEmailAPI = async (req, res, next) =>{
    
    // Extract the token from the request query
    const {token} = req. query;

    // Decode the token using the JWT secret for verfication
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_VERFICATION);

    // get user by email, isEmailVerfied = false
    // Update the user document and set isEmailVerfied = true
    const user = await updateDocumentByFindOneAndUpdate(User, {email:decodedData.email, isEmailVerified: false}, {isEmailVerified: true}, {new: true});

    // Check if the user is found otherwise return an error
    if(!user.success) return next(new Error('User not found', { cause : 404}));

    // Send a success response that the email is verfied
    res.status(user.status).json({success: user.success, message: 'Email verfied successfully, please try to login'});

}

// ================================= SignIn API ======================
/**
 * destructuring the required data from the request body
 * get user by email and check if isEmailVerfied = true
 * if not return error invalid login credentials
 * if found
 * check if the password is correct
 * if not return error invalid login credentails
 * if found 
 * generate login token
 * update isLoggedIn = true in the database
 * return the response
 */
/**
 * Sign in API endpoint 
 * 
 * @param {import('express').Request} req  - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Returns success response that the user is logged in
 * 
 * @throws {Error} If invalid login credentials
 */
export const signInAPI = async ( req, res, next) => {

    // destructuring the required data from the request body
    const {email, password} = req.body;

    // get user by email and check if isEmailVerfied = true
    const user = await findDocumentByFindOne(User, {email, isEmailVerified: true});

    // Check if the user is found otherwise return an error
    if (!user.success) return next(new Error('Invalid login credentials', { cause: 404}))

    // check the password 
    const isPasswordValid = bcrypt.compareSync(password, user.isDocumentExists.password);

    // If the password is not valid return an error
    if (!isPasswordValid) return next(new Error('Invalid login credentials', {cause: 404}))

    // Generate login token with user email and user id and loggedIn = true
    const token = jwt.sign({ email, id: user.isDocumentExists._id, loggedIn: true}, process.env.JWT_SECRET_LOGIN, {expiresIn: '1d'});

    // update isLoggedIn = true in the database
    user.isDocumentExists.isLoggedIn = true;
    
    // Save the updated user document
    await user.isDocumentExists.save();

    // Send a success response that the user is logged in with token
    res.status(user.status).json({success: user.success, message: 'User logged in successfully', data: { token}});


}