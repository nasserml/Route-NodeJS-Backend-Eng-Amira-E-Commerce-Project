import Coupon from '../../../DB/models/coupon.model.js';
import CouponUsers from '../../../DB/models/coupon-users.model.js';
import { createDocumnetByCreate, findDocumentByFind, findDocumentByFindById, findDocumentByFindOne } from '../../../DB/dbMethods.js';

import User from '../../../DB/models/user.model.js';

import { couponValidation } from '../../utils/coupon-validation.js';
import { DateTime } from 'luxon';

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

/**
 * Disable coupon API endpoint
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response.json} JSON response - Return success response that the coupon is disabled successfully
 * 
 * @throws {Error} If the coupon not found
 * @throws {Error} If the coupon is already disabled
 */
export const disableCouponAPI=async(req,res,next)=>{

    // Extract the coupon id from the request params
    const {couponId}=req.params;

    // Extract the disbledby id user from the reuest auth user
    const {_id:disabledBy}=req.authUser;

    // Find the coupon document using couppn id and disabled by from couppn collection from the database using find by one method
    const disabledCoupon=await findDocumentByFindOne(Coupon,{_id:couponId,addedBy:disabledBy});

    // Check if the coupon is exists if it not exist return an error
    if(!disabledCoupon.success) return next({message:'Coupon not found',cause:404});
    
    // Check if the coupon is disabled if it is disabled return an error
    if(!disabledCoupon.isDocumentExists.isEnabled) return next({message:'Coupon is already disabled',cause:400});

    // Update the coupon document isenabled to false
    disabledCoupon.isDocumentExists.isEnabled=false;

    // Update the coupon disabledby to disabledby
    disabledCoupon.isDocumentExists.disabledBy=disabledBy;

    // Update the document disabled at to the dtae time now
    disabledCoupon.isDocumentExists.disabledAt=DateTime.now();

    // Save the updated coupon document in the database
    await disabledCoupon.isDocumentExists.save();

    // Return success response that the coupon is disabled successfully
    res.status(disabledCoupon.status).json({message:'Coupon is disabled successfully',coupon:disabledCoupon.isDocumentExists});
}

/**
 * Enable coupon API endpoint
 * 
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response.json} JSON response - Success response that the coupon is enabled successfully
 * 
 * @throws {Error} If the coupon not found in the database
 * @throws {Error} If the coupon is already enabled  
 */
export const enableCouponAPI=async(req,res,next)=>{

    // Extract the coupon id from the request params
    const{couponId}=req.params;

    // Extract enabled by user id from the request auth user
    const{_id:enabledBy}=req.authUser;

    // Find the coupon document in the coupon collection in the database based on coupon id and enabled by id using find one method
    const enabledCoupon=await findDocumentByFindOne(Coupon,{_id:couponId,addedBy:enabledBy});

    // Chech if the coupon exists it it is not retyurn an error
    if(!enabledCoupon.success) return next({message:'Coupon not found',cause:404});

    // Check if the coupon is already enabled if itis return an error
    if(enabledCoupon.isDocumentExists.isEnabled) return next({message:'Coupon is already enabled',cause:400});

    // Update the coupon document is enabled property to true indicating that the coupon is enavbled
    enabledCoupon.isDocumentExists.isEnabled=true;

    // Update the coupon document enabled by property to the user enabled by
    enabledCoupon.isDocumentExists.enabledBy=enabledBy;

    // Update the coupon document enable at property to the date time now 
    enabledCoupon.isDocumentExists.enabledAt=DateTime.now();

    // Save the updated coupon document in the database
    await enabledCoupon.isDocumentExists.save();

    // Send success response that thecoupo  is enabled successfuklly
    res.status(enabledCoupon.status).json({message:'Coupon enabled successfully',coupon:enabledCoupon.isDocumentExists});


}

/**
 * Get all disabled coupons API endpoint
 * 
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response.json} JSON response - Send success response that the disabled coupons fetched successfully
 * 
 * @throws {Error} If no disabled coupons is found
 */
export const getAllDisabledCouponsAPI=async(req,res,next)=>{

    // Find all disabled coupons documents in the coupon collection in the databse using isEnabled to false
    const disabledCoupons=await findDocumentByFind(Coupon,{isEnabled:false});

    // If no disabled coupons documetns is found return error
    if(!disabledCoupons.success || !disabledCoupons.isDocumentExists.length) return next({message:'No disabled coupons found',cause:404});

    // Send success response that the disabled documetns fetched successfully
    res.status(disabledCoupons.status).json({message:'Disabled coupons fetched successfully', coupons:disabledCoupons.isDocumentExists})
}

/**
 * Get all the enabled coupons documents from the coupon collection in the database API enpoint
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response.json} JSON response - Send success response with  the enabled coupons documets 
 * 
 * @throws {Error} If no enabled coupons documetns is found in the database 
*/
export const getAllEnabledCouponsAPI=async(req,res,next)=>{

    // Find all enabled coupons documents in the coupon collection from the database using find method based on isEnabled property equals true
    const enabledCoupons=await findDocumentByFind(Coupon,{isEnabled:true});

    // If there is no enabled documents coupons found return an error
    if(!enabledCoupons.success || !enabledCoupons.isDocumentExists.length) return next({message:'No enabled coupons found',cause:404});

    // Send success response that the enabled coupons fetched successfully
    res.status(enabledCoupons.status).json({message:'Enabled coupons fetched successfully', coupons:enabledCoupons.isDocumentExists});
}

/**
 * Find coupon document by id from coupon collection in the database API endpoint
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response.json} JSON response - Send success response that the coupon fetched successfully
 * 
 * @throws {Error} If the coupon document not found
 */
export const getCouponByIdAPI=async(req,res,next)=>{

    // Extract the coupon id from the request parameters
    const {couponId}=req.params;

    // Finf=d the coupon document from coupon collection in the database using find by id method
    const findCoupon=await findDocumentByFindById(Coupon,couponId);

    // If thre coupon document not found return an error that the coipon not found
    if(!findCoupon.success) return next({message:'Coupon not found',cause:404});

    // Send success response that the coupon is fetched successfully with the coupon document
    res.status(findCoupon.status).json({message:'Coupon fetched successfully', coupon:findCoupon.isDocumentExists});
}

/**
 * Update coupon API endpoint.
 * 
 * @description This api endpoint will update the coupon document by its id in the coupon collection in the database
 * 
 *  @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @param {couponId} from req.params - id of the coupon document to update
 * @param {_id} from req.authUser - id of the user who is updating the coupon
 * @param {newCouponCode, newCouponAmount, newFromDate, newToDate, NewUsers} from req.body - coupon update data
 * 
 * @returns {import('express').Response} JSON response - Returns success response that the coupon is updated successfully
 * 
 * @throws {Error} If the coupon document not found
 * @throws {Error} If the coupon code is laready exists
 * @throws {Error} If the coupon amount is greater than 100 if the coupon is precentage
 * @throws {Error} If the coupon users already exists
 * @throws {Error} If the users not found
 * @throws {Error} If the coupon users or coupon not created in the database or updated
 */
export const updateCouponAPI=async(req,res,next)=>{
    
    // Exxtract the coupon id from the request params
    const {couponId}=req.params;

    // Extratct the user id from the request auth user
    const {_id:updatedBy}= req.authUser;

    // Extract the coupon update data from the request body
    const {newCouponCode,newCouponAmount,newFromDate,newToDate, NewUsers}=req.body;

    // Find the coupon documnet in the coupon collection in the database based on the id and added by
    const updatedCoupon=await findDocumentByFindOne(Coupon,{_id:couponId,addedBy:updatedBy});

    // If the coupn document not foun return an error
    if(!updatedCoupon.success) return next({message:'Coupon not found',cause:404});


    // Check if the coupon name is provided 
    if(newCouponCode) {

        // If the new coupon code is the same aas the existing one return an error
        if(newCouponCode === updatedCoupon.isDocumentExists.couponCode) return next({message:'Enter coupon code  different from the existing one',cause:400})

        // If the new coupon code is already exists in the data base 
        const isCouponCodeExists=await findDocumentByFindOne(Coupon,{couponCode:newCouponCode});

        // If it is exists retunr an error
        if(isCouponCodeExists.success) return next({message:'Cannot creeate this coupon code', cause:400});

        // Update the coupon code to the new coupon code
        updatedCoupon.isDocumentExists.couponCode=newCouponCode;
    }

    // Check ifd the coupon amount is provided
    if(newCouponAmount) {

        // If the coupon is precentage and the coupon amount is greater than 100 retutn an error hta precentage should be less than 100
        if(updatedCoupon.isDocumentExists.isPercentage && newCouponAmount>100) return next({message:'Precentage should be less than 100', cause:400});

        // Update the coupon amount in the database
        updatedCoupon.isDocumentExists.couponAmount=newCouponAmount;
    }

    // Update the coupon from date to new from date if itis provided
    if(newFromDate) updatedCoupon.isDocumentExists.fromDate=newFromDate;

    // Update the coupon to date to the newtodate if it is provided
    if(newToDate) updatedCoupon.isDocumentExists.toDate=newToDate;

    // Update document updated by to the user id who updated it
    updatedCoupon.isDocumentExists.updatedBy=updatedBy;

    // Initaite user id array and coupon users
    let userIdArr=[];
    let couponUsers;

    // Check if the NewUsers are provided
    if(NewUsers){

        // Loop through the new users array
        for(const user of NewUsers){

            // Push the user ids to the useridarray
            userIdArr.push(user.userId);
        }

        // Check if the coupon users exists in the coupon user collection using the coupon id and the userid and useridarr
        const isCouponUsersExits=await findDocumentByFind(CouponUsers,{couponId:updatedCoupon.isDocumentExists._id,userId:{$in:userIdArr}});
        
        // If they exists return an error that the coupon users already exists
        if(isCouponUsersExits.isDocumentExists.length) return next({message:'Coupon users already exists', cause:400});

        // Check if the users exists in the database usiing useridarr
        const isUsersExists=await findDocumentByFind(User,{_id:{$in:userIdArr}});

        // If the at least one user not found reurn an erro user not found as if the number of found users documents is not equal to length og the users data 
        if(isUsersExists.isDocumentExists.length !== NewUsers.length) return next({message:'User not found',cause:404});

        // Create coupon users in the database using the new users array and the coupon id and user id and max usage
        couponUsers = await createDocumnetByCreate(CouponUsers,NewUsers.map(ele=>({couponId:updatedCoupon.isDocumentExists._id,userId:ele.userId,maxUsage:ele.maxUsage})));
    }

    // Save the updated coupon document in the coupon collection ion the database
    await updatedCoupon.isDocumentExists.save();

    // Send success response that coupon updated successfully
    res.status(201).json({message:'Coupon updated successfully',updatedCoupon:updatedCoupon.isDocumentExists,couponUsers:couponUsers?.createDocument})



}
