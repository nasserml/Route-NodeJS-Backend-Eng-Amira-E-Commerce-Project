import { DateTime } from 'luxon';

import {couponValidation} from '../../utils/coupon-validation.js';
import { qrCodeGeneration } from '../../utils/qr-code.js';

import Order from '../../../DB/models/order.model.js';
import Cart from '../../../DB/models/cart.model.js';
import CouponUsers from '../../../DB/models/coupon-users.model.js';
import Product from '../../../DB/models/product.model.js';

import { checkProductAvailability } from '../Cart/utils/check-product-in-db.js';
import { createDocumnetByCreate, findDocumentByFindOne } from '../../../DB/dbMethods.js';
//===============================Create order API =========================
/**
 * @description Create order APi endpoint
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response.json} JSON response - Returns success response that the order is created
 * 
 * @throws {Error} If the coupon is not valid
 * @throws {Error} If the coupon is not found  
 * @throws {Error} If the product is not available
 * @throws {Error} If Cannot apply this coupon for this order
 * @throws {Error} if order is not created in the database
 */
export const createOrderAPI = async (req,res,next)=>{

    // 1- Destructuring product, quantity, couponCode, paymentMethod, address, city, postalCode, country, phoneNumbers from the request body
    const{product, quantity,couponCode,paymentMethod,address,city,postalCode,country,phoneNumbers}=req.body;

    // 2- Destructuring _id as userId from the request authUser
    const{_id:user}=req.authUser;

    // 3- Initiate coupon variable 
    let coupon=null;
    
    // 4- Check if the coupon code is snet
    if(couponCode){

        // 4.1- Check if the coupon is valid or not
        const isCouponValid=await couponValidation(couponCode,user);

        // 4.2- If the coupon is not valid return error
        if(isCouponValid.status) return next({message:isCouponValid.message,status:isCouponValid.status});

        // 4.3- If the coupon is valid return coupon
        coupon=isCouponValid;
    }
    
    // 5- Check if the product is available
    const isProductAvailable=await checkProductAvailability(product,quantity);

    // 6- If the product is not available return error
    if(!isProductAvailable) return next({message:'Product is not avaliable', status:400});
    
    // 7- Create order items
    const orderItems = [{title:isProductAvailable.title,quantity,price:isProductAvailable.appliedPrice,product:isProductAvailable._id}];

    // 8- Create shipping price to applied price multiple by quantity
    const shippingPrice = isProductAvailable.appliedPrice*quantity;

    // 9- Create total price to shipping price
    let totalPrice=shippingPrice;

    // 10- Check if the coupon is fixed and not greater than shipping price if it is then return error
    if(coupon?.isFixed&&coupon?.couponAmount>shippingPrice)return next({message:'Cannot apply this coupon for this order',cause:400});

    // 11- Check if the coupon is fixed then calculate total price 
    if(coupon?.isFixed&&coupon) totalPrice=shippingPrice-coupon.couponAmount;

    // 12- Check if the coupon is precentage then calculate total price 
    else if(coupon?.isPercentage) totalPrice=shippingPrice-(shippingPrice*(coupon.couponAmount/100));

    // 13- Change order statu to placed if payment method is cash
    let orderStatus;
    if(paymentMethod=='Cash')orderStatus='Placed';

    // 14- Create order object
    const orderObject={user,orderItems,shippingAddress:{address,city,postalCode,country},phoneNumbers,shippingPrice,coupon:coupon?._id,totalPrice,paymentMethod,orderStatus};

    // 15- Create order in the database
    const order = await createDocumnetByCreate(Order,orderObject);

    // 16- If order is not created return error
    if(!order.success)return next({message:'Order creation faild',status:500});

    // 17- Generate qrcode with the order
    const qrcode=await qrCodeGeneration({orderId:order.createDocument._id,orderStatus:order.createDocument.orderStatus,totalPrice:order.createDocument.totalPrice,paymentMethod:order.createDocument.paymentMethod});

    // 18- Update product stock by subtracting the quantity
    isProductAvailable.stock-=quantity;
    
    // 19- Save product
    await isProductAvailable.save();

    // 20- Check if coupon is applied or not
    if(coupon){

        // 20.1- Find the coupon user
        const userCoupon = await findDocumentByFindOne(CouponUsers,{couponId:coupon._id,userId:user});

        // 20.2- Update the coupon usage count by 1
        userCoupon.isDocumentExists.usageCount+=1;

        // 20.3- Save coupon user
        await userCoupon.isDocumentExists.save();
    }
    
    // 21- Send response with success message and order and qrcode
    res.status(order.status).json({message:'Order created successfully',order:order.createDocument, qrcode});

}