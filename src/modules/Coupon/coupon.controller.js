import Coupon from '../../../DB/models/coupon.model.js';
import CouponUsers from '../../../DB/models/coupon-users.model.js';
import { createDocumnetByCreate, findDocumentByFind, findDocumentByFindOne } from '../../../DB/dbMethods.js';

import User from '../../../DB/models/user.model.js';

import { couponValidation } from '../../utils/coupon-validation.js';

// ===================== Add coupon API =======================
/**
 * @description Add coupon API endpoint
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @param {couponCode, couponAmount, fromDate, toDate, isFixed, isPercentage, Users } from req.body
 * @param {_id} from req.authUser
 * 
 * @returns {import('express').Response} JSON response - Returns success response that the coupon is added successfully
 * 
 * @throws {Error} If the coupon already exists
 * @throws {Error} If isFixed and isPercentage are equal
 * @throws {Error} If isPercentage is true and couponAmount is greater than 100
 * @throws {Error} If user not found
 * @throws {Error} If coupon is not created in the database
 */
export const addCouponAPI = async (req, res, next ) => {

    // 1- Destructuring the coupon code, coupon amount, from date, to date, isFixed, isPercentage, Users from the request body
    const {couponCode, couponAmount, fromDate, toDate, isFixed, isPercentage, Users } = req.body;

    // 2- Destructuring _id as addedBy from the request authUser
    const { _id: addedBy } = req.authUser;

    // 3- Check if the coupon already exists in the database
    const coupon = await findDocumentByFindOne(Coupon, {couponCode});

    // 4- If it is exists return error coupon already exists
    if(coupon.success) return next( { message:'Coupon already exists', cause: 409 } );

    // 5- Check if isFixed and isPercentage are equal if they are not equal return error that Coupon can be either fixed or percentage
    if ( isFixed == isPercentage ) return next( { message: 'Coupon can be either fixed or percentage', cause : 400 } );

    // 6- Check if isPercentage is true and couponAmount is greater than 100 if it is not return error percentage should be less than 100
    if ( isPercentage && couponAmount > 100 ) return next( { message: 'Percentage should be less than 100', cause: 400 } );

    // 7- Create coupon object
    const couponObject = { couponCode, couponAmount, fromDate, toDate, isFixed, isPercentage, addedBy };

    // 8- Create coupon in the database
    const newCoupon = await createDocumnetByCreate( Coupon, couponObject );

    // 9- Initialize userIds array
    let userIdsArr = [] ;

    // 10- Loop through the Users array to get userIds and maxUsage for the coupon 
    for( const user of Users ) {

        // 10.1- Push user id to the user ids array
        userIdsArr.push(user.userId)

    }

    // 11- Check if the userids exists in the database
    const isUsersExists = await findDocumentByFind(User, { _id: { $in: userIdsArr}});

    // 12 - Check the length of the userexists and Users length array if they are not equal return an error that the user not found
    if( isUsersExists.isDocumentExists.length !== Users.length ) return next({ message: 'User not found', cause: 404 });

    // 13- Create coupon users in the database for each user id
    const couponUsers = await createDocumnetByCreate(CouponUsers, Users.map( ele => ( { couponId: newCoupon.createDocument._id, userId: ele.userId, maxUsage: ele.maxUsage  }  ) ) );

    // 14- Sned success response that the coupon is added successfully
    res.status(201).json( { message : 'Coupon added successfully', newCoupon: newCoupon.createDocument, couponUsers: couponUsers.createDocument });
}

/**
 * @description Apply coupon API endpoint
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response.json} JSON response - Returns success response that the coupon is applied successfully
 * 
 * @throws {Error} If the coupon is not valid
 * @throws {Error} If the coupon is not found
 */
export const applyCouponAPI = async (req, res, next)=>{

    // 1- Destructuring couponCode from the request body
    const {couponCode} = req.body;

    // 2- Destructuring _id as userId from the request authUser
    const {_id:userId} = req.authUser;

    // 3- Call coupon validation function
    const couponCheck = await couponValidation(couponCode,userId);

    // 4- If the coupon is not valid return error
    if(couponCheck.status) return next({message:couponCheck.message,cause:couponCheck.status});

    // 5- Return success response that the coupon is applied successfully
    res.status(200).json({message:'Coupon applied successfully'});
}