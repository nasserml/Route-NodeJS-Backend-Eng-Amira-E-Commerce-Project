import { DateTime  } from 'luxon';

import Coupon from '../../DB/models/coupon.model.js';
import CouponUsers from '../../DB/models/coupon-users.model.js';
import { findDocumentByFindOne } from '../../DB/dbMethods.js';

/**
 * @description Validate a coupon code for a specific user and return the coupon details if it is valid. 
 * @param {String} couponCode - The coupon code to be validated.
 * @param {String} userId - The user Id to be validated.
 * @returns {object} The coupon details if it is valid.
 * 
 * @throws {Error} If the coupon code is not found.
 * @throws {Error} If the coupon is expired
 * @throws {Error} If the coupon is not started yet
 * @throws {Error} If the coupon is not assigned to this user
 * @throws {Error} If the coupon exceeded the max usage for this user
 */
export const couponValidation = async ( couponCode, userId) => {

    // 1- Check if the coupon code exists
    const coupon = await findDocumentByFindOne(Coupon, { couponCode });

    // 2- If it is not exists return error coupon not found
    if(!coupon.success) return { message: 'Coupon not found', status: 404}

    // 3- Check if the coupon is expired if it is return error coupon is expired
    if ( coupon.isDocumentExists.couponStatus === 'expired' || DateTime.fromISO(coupon.isDocumentExists.toDate) < DateTime.now()) return { message: 'Coupon is expired', status: 400};

    // 3.1- Chech if the coupon is disabled if it is then return an error
    if(!coupon.isDocumentExists.isEnabled) return {meesage:'Coupon is disabled', status:400};

    // 4- Check if the coupon is active or not if it is not return error coupon is not started yet
    if(DateTime.fromISO(coupon.isDocumentExists.fromDate)>DateTime.now()) return { message:'Coupon is not started yet', status: 400};

    // 5- Check if the coupon is assigned to this user
    const isUserAssigned = await findDocumentByFindOne(CouponUsers, {couponId:coupon.isDocumentExists._id, userId});

    // 6- If the coupon is not assigned to this user return error coupon is not assigned to you
    if(!isUserAssigned.success) return {message:'coupon is not assigned to you', status: 400};

    // 7- Check if the coupon exceeded the max usage for this user and if it is return error coupon exceeded the max usage
    if(isUserAssigned.isDocumentExists.usageCount >= isUserAssigned.isDocumentExists.maxUsage) return {message:'Coupon exceeded the max usage', status: 400};

    // 8- Return the coupon details
    return coupon.isDocumentExists;

}