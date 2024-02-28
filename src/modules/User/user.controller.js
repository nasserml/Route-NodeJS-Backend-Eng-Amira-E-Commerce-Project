import User from '../../../DB/models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { deleteDocumentByFindOneAndDelete, findDocumentByFindById, findDocumentByFindOne } from '../../../DB/dbMethods.js'
import sendEmailService from '../../services/send-email.service.js';


//========================= Update user API =================== 
/**
 * Upodate user API  endpoint 
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('expres').Response.status().json()} JSON response - Returns success response that the user is updated successfully.
 * 
 * @throws {Error} If the user is not logged in.
 * @throws {Error} If email is already exists in the database
 * @throws {Error} IF the email for verification is not sent to the user
 * @throws {Error} If the user enter an invalid old password.
 * @throws {Error} If the user not updated in the database.
 * 
 */
export const updateUserAPI = async (req, res, next) => {

    // 1- Destructuring the usernamem, emai, oldPassword, newPassword, age, phoneNumbers and addresses from the request body
    const { username, email,oldPassword, newPassword, age, phoneNumbers, addresses} = req.body;

    // 2- Destructuring the auth user id form request authUser
    const {_id} = req.authUser;
    
    // 3- Check if the user exists in the database and is loggedIn
    const updatedUser = await findDocumentByFindOne(User, {_id, isLoggedIn: true});

    // 3- If it not exists return an error login required
    if(!updatedUser.success) return next(new Error('Login required', {cause: 401}));

    // 4- Check if the username is send 
    if(username) updatedUser.isDocumentExists.username = username; // 4.1- Update the username

    // 5- Check if the age is sent
    if(age) updatedUser.isDocumentExists.age = age; // 5.1- update The age

    // 6- Check if the phioneNumbers is sent
    if(phoneNumbers) updatedUser.isDocumentExists.phoneNumbers = phoneNumbers; // 6.1= Update the phoneNumbers

    // 7- Check if the addresses is sent
    if(addresses) updatedUser.isDocumentExists.addresses = addresses; // 7.1- Update the addresses

    // 8- Check if the email is sent
    if(email) {

        if(email === updatedUser.isDocumentExists.email) return next(new Error('Please enter a different email address than the xexissting one', {cause: 409}));

        //8.1- Check if the email is already exists in the database
        const isEmailExists = await findDocumentByFindOne(User, {email})

        // 8.2- If it is already exists in the database then retuirn an error that email is already eists
        if(isEmailExists.success) return next(new Error('Email is already exists', {cause: 409}));

        // 8.3- Update the email
        updatedUser.isDocumentExists.email = email;
        
        // 5.4- Update the isEmailVeridfied to false
        updatedUser.isDocumentExists.isEmailVerified = false;

        // 5.5- Generate token fo the user to verify the email
        const userToken = jwt.sign({email}, process.env.JWT_SECRET_VERFICATION, { expiresIn: '2m'});

        // 5.6- Send mail to the new use email for verification
        const isEmailSent = await sendEmailService({to: email, subject: 'Email Verfication', message: `<h2>Please click on the link to verfiy your email</h2><a href="http://localhost:3000/auth/verfiy-email?token=${userToken}">Verfiy Email</a>`});

        // 5.7- If it is not sent return an error that email is not sent
        if(!isEmailSent) return next(new Eroor('Email is not sent please try again later', {cause: 500}));
    }

    // 9- Check if the oldPassword and newPassword are snet
    if(oldPassword && newPassword) {

        // 9.1- Check if the old password is coorect
        const isPasswordMatched = bcrypt.compareSync(oldPassword, updatedUser.isDocumentExists.password);

        // 9.2- If it is not correct return an error invalid old password
        if(!isPasswordMatched) return next(new Error('Invalid old password', {cause: 404}));
  
        // 9.3- Hash the new password
        const hashNewPassword = bcrypt.hashSync(newPassword, +process.env.SALT_ROUNDS);

        // 9.4- Update the password in the database
        updatedUser.isDocumentExists.password = hashNewPassword;
    }

    // 10- Update the user in the database
    await updatedUser.isDocumentExists.save()

    // 11- Return success response that the user is updated successfully
    return res.status(updatedUser.status).json({ suucces: updatedUser.success, message: 'User Updated successfully'});
}

//=============================== Delete user API =======================
/**
 * Delete user API endpint
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response.status().json()} JSON response - Returns success response that the user is deleted successfully
 * 
 * @throws {Error} If the user is not logged in
 */
export const deleteUserAPI = async (req, res, next) => {
    
    // 1- Destructuring the auth user id form request authUser
    const {_id} = req.authUser;

    // 2- Delete the user from the database 
    const deleteUser = await deleteDocumentByFindOneAndDelete(User, { _id, isLoggedIn: true});

    // 3- Check if the user exists in the database and deleted successfully and logged in
    if(!deleteUser.success) return next(new Error('Login required', {cause: 401})); // 3.1- Return an error that the user is not logged in

    // 4- Return success response that the user is deleted successfully
    res.status(deleteUser.status).json({message: 'User deleted successfully',success: deleteUser.success, deleteUser});
}

//=============================== Get user profile data API =======================
/**
 * Get user profile data API endpoint
 * @param {import('express').Request} req - Express request object 
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 *
 *  @returns {import('express').Response.status().json()} JSON response - Returns success response with the user data profile
 * 
 *  @throws {Error} If the user not found
 */
export const getUserProfileDataAPI = async (req, res, next) => {

    // 1- Destructuring the user id from the request params
    const {userId} = req.params;

    // 2- Find the user by user id from the database and exclude the password, email, isEmailVerified, isLoggedIn, createdAt, updatedAt, __v
    const userData = await findDocumentByFindById(User, userId, '-password -isEmailVerified -email -isLoggedIn -createdAt -updatedAt -__v ');

    // 4- Check if the user exists in the database 
    if(!userData.success) return next(new Error('User not found', {cause: 500})) // 4.1- Return an error that the user is not found

    // 5- Return success response with the user data profile
    res.status(userData.status).json({message: 'User found', success: userData.success, data: userData.isDocumentExists});

}