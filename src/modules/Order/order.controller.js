import { DateTime } from 'luxon';

import {couponValidation} from '../../utils/coupon-validation.js';
import { qrCodeGeneration } from '../../utils/qr-code.js';

import Order from '../../../DB/models/order.model.js';
import Cart from '../../../DB/models/cart.model.js';
import CouponUsers from '../../../DB/models/coupon-users.model.js';
import Product from '../../../DB/models/product.model.js';

import { checkProductAvailability } from '../Cart/utils/check-product-in-db.js';
import { createDocumnetByCreate, findDocumentByFindOne } from '../../../DB/dbMethods.js';

export const createOrderAPI = async (req,res,next)=>{
    const{product, quantity,couponCode,paymentMethod,address,city,postalCode,country,phoneNumbers}=req.body;
    const{_id:user}=req.authUser;
    let coupon=null;
    if(couponCode){
        const isCouponValid=await couponValidation(couponCode,user);
        if(isCouponValid.status) return next({message:isCouponValid.message,status:isCouponValid.status});
        coupon=isCouponValid;
    }
    
    const isProductAvailable=await checkProductAvailability(product,quantity);
    if(!isProductAvailable) return next({message:'Product is not avaliable', status:400});
    
    const orderItems = [{title:isProductAvailable.title,quantity,price:isProductAvailable.appliedPrice,product:isProductAvailable._id}];
    const shippingPrice = isProductAvailable.appliedPrice*quantity;
    let totalPrice=shippingPrice;

    if(coupon?.isFixed&&coupon?.couponAmount>shippingPrice)return next({message:'Cannot apply this coupon for this order',cause:400});
    if(coupon?.isFixed&&coupon) totalPrice=shippingPrice-coupon.couponAmount;
    else if(coupon?.isPercentage) totalPrice=shippingPrice-(shippingPrice*(coupon.couponAmount/100));

    let orderStatus;
    if(paymentMethod=='Cash')orderStatus='Placed';

    const orderObject={user,orderItems,shippingAddress:{address,city,postalCode,country},phoneNumbers,shippingPrice,coupon:coupon?._id,totalPrice,paymentMethod,orderStatus};

    const order = await createDocumnetByCreate(Order,orderObject);
    if(!order.success)return next({message:'Order creation faild',status:500});

    const qrcode=await qrCodeGeneration({orderId:order.createDocument._id,orderStatus:order.createDocument.orderStatus,totalPrice:order.createDocument.totalPrice,paymentMethod:order.createDocument.paymentMethod});

    isProductAvailable.stock-=quantity;
    await isProductAvailable.save();

    if(coupon){
        const userCoupon = await findDocumentByFindOne(CouponUsers,{couponId:coupon._id,userId:user});
        userCoupon.isDocumentExists.usageCount+=1;
        await userCoupon.isDocumentExists.save();
    }

    res.status(order.status).json({message:'Order created successfully',order:order.createDocument, qrcode});

}