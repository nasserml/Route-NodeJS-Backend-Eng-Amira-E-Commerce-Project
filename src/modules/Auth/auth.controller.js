import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {OAuth2Client} from 'google-auth-library';

import generateUniqueString from '../../utils/generate-Unique-String.js';
import User from '../../../DB/models/user.model.js';
import sendEmailService from '../../services/send-email.service.js';
import { createDocumnetByCreate, findDocumentByFindById, findDocumentByFindOne, updateDocumentByFinByIdAndUpdate, updateDocumentByFindOneAndUpdate } from '../../../DB/dbMethods.js';

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
    
    // Update the user document with the new login token 
    user.isDocumentExists.token=token;

    // Save the updated user document
    await user.isDocumentExists.save();

    // Send a success response that the user is logged in with token
    res.status(user.status).json({success: user.success, message: 'User logged in successfully', data: { token}});


}

/**
 * Forget password API end point
 * 
 * @param {import('express').Request} req  - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Returns success response to the user check its email for reset password
 * 
 * @throws {Error} If invalid email
 * @throws {Error} If email is not sent
 */
export const forgetPasswordAPI=async(req,res,next)=>{
    
    // Extract the email form the request body
    const {email}=req.body;

    // Find the user by the email in the database
    const user=await findDocumentByFindOne(User,{email});

    // If the user not found return an error
    if(!user.success) return next(new Error('Invalid Email',{cause:400}));

    // Generate a unique code for password reset
    const code=generateUniqueString(6);

    // Hash the generated code
    const hashedCode=bcrypt.hashSync(code,+process.env.SALT_ROUNDS);

    // Creae a jwt token containing the email and the ahshed code
    const token=jwt.sign({payload:{email,sentCode:hashedCode}},process.env.RESET_TOKEN,{expiresIn:'1h'});

    // Construct the reset password llink
    const resetPasswordLink=`${req.protocol}://${req.headers.host}/auth/reset-password/${token}`;

    // send the reset password link to the use
    const isEmailSent=sendEmailService({to:email,subject:'Reset Password',message:`<h2>Please click on this link to reset your password</h2><a href=${resetPasswordLink}>Reset Password</a>`})

    // If the email not sent return an error
    if(!isEmailSent) return next(new Error('Fail to sent the password email',{cause:400}));

    // Update user forget code in the database
    const userUpdates=await updateDocumentByFindOneAndUpdate(User,{email},{forgetCode:hashedCode},{new:true});

    // Send a success response with message and the updated user information
    res.status((200)).json({message:'Check your email to reset your password',userUpdates:userUpdates.updateDocument})
}

/**
 * Reset password API end point
 * 
 * @param {import('express').Request} req  - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Returns success response thath password reset successfully
 * 
 * @throws {Error} If The user already reset the password
 */
export const resetPasswordAPI=async(req,res,next)=>{

    // Extract the token from the request parameters
    const {token}=req.params;

    // Decode the token using the reset token
    const decoded=jwt.verify(token,process.env.RESET_TOKEN);

    // Find the user based on the email and the sent code
    const user=await findDocumentByFindOne(User,{email:decoded?.payload.email,forgetCode:decoded?.payload.sentCode});

    // If the user not found return an error
    if(!user.success) return next(new Error('You are already reset your password, try to login',{cause:400}));

    // Extract the new password from the request body
    const {newPassword}=req.body;

    // Hash the new password using the salt rounds
    const hashedNewPassword=bcrypt.hashSync(newPassword,+process.env.SALT_ROUNDS);

    // Update the user password in the database
    user.isDocumentExists.password=hashedNewPassword;

    // Remove the forget code in the database
    user.isDocumentExists.forgetCode=null;

    // Save the updated user data
    const resetedPassData=await user.isDocumentExists.save();

    // Send a success response with message and the updated user information
    res.status(user.status).json({message:'Password reset successfully',success:user.success, resetedPassData:resetedPassData})
}

/**
 * Login a user via Gmail authenticaion, verfies the user's email, generate a login token, and update the user's Information in the database API end point.
 * 
 * @param {import('express').Request} req - Express request object containing the user's idToken in the body 
 * @param {import('express').Response} res - Express response object to send back a success or error message
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Returns success response that the user is logged in successfully
 * 
 * @throws {Error} If the user's email is not verfied
 * @throws {Error} If the user is not found in the database invalid login credentials
 */
export const loginWithGmailAPI=async(req,res,next)=>{

    // Extract the idToken from the request body
    const {idToken}=req.body;

    // Create a new OAuth2Client
    const client = new OAuth2Client();

    // Function to verfiy the idToken
    /**
     * Verfit the id token using the client and return the payload.
     * @returns {object} The pay load extracted from the verfied id token
     */
    async function verify() {

        // Verfiy the id token using the client
        const ticket = await client.verifyIdToken({idToken ,audience:process.env.CLIENT_ID,  
            // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });

        // Get the payload from the verfied id token
        const payload = ticket.getPayload();
        
        // If request specified a G Suite domain:
        // const domain = payload['hd'];

        // Return the payload
        return payload;
    }

    // Call the verfiy function and catch any errors
    const result=await verify().catch(console.error);

    // Check if the email is verfied if not return an error
    if(result.email_verified !== true) return next(new Error('Email is not verfied, please enter another email', {cause:400}));

    
    // get user by email and check if isEmailVerfied = true
    const user = await findDocumentByFindOne(User, {email:result.email, provider:'GOOGLE'});

    // Check if the user is found otherwise return an error
    if (!user.success) return next(new Error('Invalid login credentials', { cause: 404}))


    // Generate login token with user email and user id and loggedIn = true
    const token = jwt.sign({ email:result.email, id: user.isDocumentExists._id, loggedIn: true}, process.env.JWT_SECRET_LOGIN, {expiresIn: '1d'});

    // update isLoggedIn = true in the database
    user.isDocumentExists.isLoggedIn = true;
    
    // Update the user document with the new login token 
    user.isDocumentExists.token=token;

    // Save the updated user document
    await user.isDocumentExists.save();

    // Send success response that the user is logged in successfully
    res.status(200).json({success:true,message:'User logged in successfully',data:{token}})
}

/**
 * Sign up user using gmail API endpoint.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Returns success response that the user is signed up successfully
 * 
 * @throws {Error} If the user's email is not verfied
 * @throws {Error} If the user's email is already exists
 * @throws {Error} If the user is not created in the database
 */
export const signUpWithGmailAPI=async(req,res,next)=>{

    // Extract the idToken from the request body
    const {idToken}=req.body;

    // Create a new OAuth2Client
    const client = new OAuth2Client();

    // Function to verfiy the idToken
    /**
     * Verfit the id token using the client and return the payload.
     * @returns {object} The pay load extracted from the verfied id token
     */
    async function verify() {

        // Verfiy the id token using the client
        const ticket = await client.verifyIdToken({idToken ,audience:process.env.CLIENT_ID,  
            // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });

        // Get the payload from the verfied id token
        const payload = ticket.getPayload();
        
        // If request specified a G Suite domain:
        // const domain = payload['hd'];

        // Return the payload
        return payload;
    }

    // Call the verfiy function and catch any errors
    const result=await verify().catch(console.error);

    // Check if the email is verfied if not return an error
    if(result.email_verified !== true) return next(new Error('Email is not verfied, please enter another email', {cause:400}));

     // check if the user already exists in the database using the email
     const isEmailDuplicated = await findDocumentByFindOne(User, {email:result.email});

     // If the user already exists in the database returning an error
     if (isEmailDuplicated.success) return next(new Error('Email already exists, Please try another email', {cause: 409}));

     // Generate random password
     const randomPassword=Math.random().toString(36).slice(-8);
     
     // Random password hashing 
     const hashedPassword = bcrypt.hashSync(randomPassword, +process.env.SALT_ROUNDS);

     // create new document in the database
     const newUser = await createDocumnetByCreate(User, {username:result.name, email:result.email, password: hashedPassword,isEmailVerified:true,provider:'GOOGLE'});

     // Check if the user is created in the database otherwise return an error
     if (!newUser.success) return next(new Error('User not created', {cause: 500}));

     // Return the response that the user is created successfully with the new user data
     res.status(newUser.status).json({success: newUser.success, message: 'User created successfully, please login and complete your profile', data: newUser});
}


/**
 * Soft delete user API endpoint.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Success response that the user is fot deleted successfully
 * 
 * @throws {Error} - If the user doesnot exists in the database
 */
export const softDeleteUserAPI=async(req,res,next)=>{
    
    // Destructuring the id of the user from auth user
    const{_id}=req.authUser;

    // Update the user by find by id and update to set the isSoftDeleted to true with isLogggedIn to false 
    const user=await updateDocumentByFinByIdAndUpdate(User,_id,{isSoftDeleted:true,isLoggedIn:false},{new:true});
    
    // If the user is not updated return an error
    if(!user.success) return next(new Error('Invalid user', {cause: 500}));

    // Send success response that the user is soft deleted successfully 
    res.status(user.status).json({message:'User soft deleted successfully',success:user.success,data:user.updateDocument});
}

/**
 * Update the user password API endpoint
 * 
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Success response that the user password is updated successfully
 * 
 * @throws {Error} - If the new password is the same as the old password.
 * @throws {Error} - If the user not found in the datanase
 * @throws {Error} - If the user old password does not match the user password
 * @throws {Error} - If the user not saved successfully in the database
 */
export const updatePasswordAPI=async(req,res,next)=>{

    // Get the user id from the request authuser
    const {_id}=req.authUser;

    // Destructure the new passwotd and the old password from the request body
    const {newPassword,oldPassword}=req.body;

    // If the new password equals the old password return an error 
    if(newPassword==oldPassword) return next(new Error('The new password should be different from the old password',{cause:400}));

    // Find the user in the database by fimd by one  and isLoggedin is true
    const user=await findDocumentByFindOne(User,{_id,isLoggedIn:true});

    // If the user does not exits in the database returb ab error
    if(!user.success) return next(new Error('Invalid user',{cause:500}));

    // Check if the old passworrd match the current user password
    const isPasswordMatched=bcrypt.compareSync(oldPassword,user.isDocumentExists.password);

    // If it is not matched return an error
    if(!isPasswordMatched) return next(new Error('Invalid old password',{cause:404}));

    // Hash the nepassword using salt rounds
    const hashNewPassword=bcrypt.hashSync(newPassword,+process.env.SALT_ROUNDS);

    // Set the user current password to the new hashed passowrd
    user.isDocumentExists.password=hashNewPassword;

    // Set the isLoggedIn ito dfalse for the current user
    user.isDocumentExists.isLoggedIn=false;

    // Save the updated data of the user in the datbase with the new password 
    await user.isDocumentExists.save();

    // Send a successful response to the user that the password is updated successfully
    res.status(user.status).json({message:'Password updated successfully login with the new password', user:user.isDocumentExists});

}