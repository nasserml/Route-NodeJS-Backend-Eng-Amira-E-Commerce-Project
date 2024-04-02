import jwt from 'jsonwebtoken';
import User from '../../DB/models/user.model.js';
import { findDocumentByFindById, findDocumentByFindOne } from '../../DB/dbMethods.js';


/**
 * Middleware function for authentication and authorization using JWT.
 * Checks if the request has a valid access token and verifies it payload.
 * Sets the authenticated user in the request object.
 * 
 * @function
 * @param {Array<String>} accessRoles - Array of roles allowed to access the route.
 * @returns {Function} Express middleware function.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @throws {Error} If authentication or authorization fails, an error is passed to the next middleware.
 */
export const auth = (accessRoles) => {
    return async (req, res, next) => {
        try {
            // Extract the access token from the request headers
            const {accesstoken} = req.headers;

            // Check if the access token exists
            if(!accesstoken) return next(new Error('Please login first', {cause:400})); // If the access token is missing, return an error

            // // Check if the access token has the correct prefix
            // if(!accesstoken.startsWith(process.env.TOKEN_PREFIX)) return next(new Error('Invalid prefix', {cause:400})); // If access token has an invalid prefix, return an error
            
            // // Extract the token without the prefix
            // const token = accesstoken.split(process.env.TOKEN_PREFIX)[1];
            
            try {

                // Verify the tokewn and decode its payload
                const decodedData =  jwt.verify(accesstoken, process.env.JWT_SECRET_LOGIN);

                // Check if the token payload is valid.
                if(!decodedData || !decodedData.id) return next(new Error('Invalid token payload', {cause:400})) // If token payload is invalid, return an error

                // Check if the user exists in the database 
                const findUser = await findDocumentByFindById(User,decodedData.id, 'username email role');
                if(!findUser.success) return next(new Error('Please signUp first', {cause:404})); // If user does not exist, return an error

                
                // Check if the user role is allowed (authorization check)
                if(!accessRoles.includes(findUser.isDocumentExists.role)) return next(new Error('You are not allowed to access this route',{cause:401}));
                
                // Set the authenticated user in the request object
                req.authUser = findUser.isDocumentExists;
                
                // Call the next middleware
                next();
            } catch (error) {
                
                // Refresh token 
                // Check if the token expired or not
                if(error=='TokenExpiredError: jwt expired'){
                    
                    // Find the user in the database using the access token 
                    const findUser=await findDocumentByFindOne(User,{token:accesstoken});

                    // If the user is not found, return an error
                    if(!findUser.success) return next(new Error('Wrong token',{cause:400}));

                    // Generate a new access token and refresh token
                    const token = jwt.sign({ email: findUser.isDocumentExists.email, id: findUser.isDocumentExists._id, loggedIn: true}, process.env.JWT_SECRET_LOGIN, {expiresIn: '1d'})
                    
                    // Update the refresh token in the database
                    findUser.isDocumentExists.token=token;

                    // Save the updated user in the database
                    await findUser.isDocumentExists.save();

                    // Return the new  refresh token
                    res.status(findUser.status).json({message:'refreshed token',token})
                }
            }

        } catch (error) {
            // If any error occurs, return a generic error message
            next(new Error('catch error in auth middleware', {cause:500}));
            
        }
    };
};