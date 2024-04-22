import { DateTime } from 'luxon';

import {couponValidation} from '../../utils/coupon-validation.js';
import { qrCodeGeneration } from '../../utils/qr-code.js';

import Order from '../../../DB/models/order.model.js';
import Cart from '../../../DB/models/cart.model.js';
import CouponUsers from '../../../DB/models/coupon-users.model.js';
import Product from '../../../DB/models/product.model.js';

import { checkProductAvailability } from '../Cart/utils/check-product-in-db.js';
import { createDocumnetByCreate, deleteDocumentByFindByIdAndDelete, findDocumentByFindById, findDocumentByFindOne, updateDocumentByFinByIdAndUpdate, updateDocumentByFindOneAndUpdate } from '../../../DB/dbMethods.js';
import generateUniqueString from '../../utils/generate-Unique-String.js';
import createInvoice from '../../utils/pdf-kit.js';
import sendEmailService from '../../services/send-email.service.js';
import { confirmPaymentIntent, createCheckoutSession, createPaymentIntent, createStripeCoupon, refundPaymentIntent } from '../../payment-handler/stripe.js';
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
    
    // 21- Create order code for invoice pdf files
    const orderCode=`${req.authUser.username}_${generateUniqueString(3)}`

    // 22- Create order invoice object
    const orderInvoiceObject={shipping:{name:req.authUser.username,address:order.createDocument.shippingAddress.address,city:'Cairo city',state:'Cairo state',country:'Egypt'},orderCode,date:order.createDocument.createdAt,items:order.createDocument.orderItems,subTotal:order.createDocument.shippingPrice,paidAmount:order.createDocument.totalPrice};
    
    // 23- Create invoice pdf document 
    await createInvoice(orderInvoiceObject,`${orderCode}.pdf`);

    // 24- Send email to user with invoice pdf documents as attachment
    await sendEmailService({to:req.authUser.email,subject:'Order Confirmation',message:'<h1>Please find your invoice pdf bellow</h1>',attachments:[{path:`./Files/${orderCode}.pdf`}]})
    
    // 25- Send response with success message and order and qrcode
    res.status(order.status).json({message:'Order created successfully',order:order.createDocument, qrcode});

}

//=============================Cobvert from cart to order API================================
/**
 * @description Convert from cart to order API endpoint
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {import('express').Response.json} JSON response - Returns success response that the order is created successfully.
 * 
 * @throws {Error} If the user is not logged in
 * @throws {Error} If the cart is not found
 * @throws {Error} If the coupon is not valid
 * @throws {Error} If the coupon is not found
 * @throws {Error} If the coupon cannot be applied
 * @throws {Error} If the order is not created successfully
 */
export const convertFromCartToOrderAPI=async(req,res,next)=>{
    
    // 1- Destructuring couponCode,paymentMethod,address,city,postalCode,country,phoneNumbers from the request body
    const{couponCode,paymentMethod,address,city,postalCode,country,phoneNumbers}=req.body;

    // 2- Destructuring _id as userId from the request authUser
    const{_id:user}=req.authUser;

    // 3- Find the user cart by the userId
    const userCart=await findDocumentByFindOne(Cart,{userId:user});

    // 4- If the user cart is not found return error
    if(!userCart.success)return next({message:'Cart not found',status:userCart.status});

    // 5- Check if the coupon is valid
    let coupon=null;
    if(couponCode){

        // 5.1- Call coupon validation function
        const isCouponValid=await couponValidation(couponCode,user);

        // 5.2- If the coupon is not valid return error
        if(isCouponValid.status)return next({message:isCouponValid.message,status:isCouponValid.status});

        // 5.3- If the coupon is valid set coupon
        coupon=isCouponValid;
    }

    // 6- Create order items from the user cart products
    const orderItems=userCart.isDocumentExists.products.map(cartItem=>{return{title:cartItem.title,quantity:cartItem.quantity,price:cartItem.basePrice, product:cartItem.productId}});

    // 7- Calculate shipping price using the subTotal
    const shippingPrice=userCart.isDocumentExists.subTotal;

    // 8- Calculate total price using shipping price
    let totalPrice=shippingPrice;

    // 9- Check if the coupon is fixed and coupon amount is greater than shipping price than return error
    if(coupon?.isFixed&&coupon?.couponAmount>shippingPrice)return next({message:'Cannot apply this coupon for this order',cause:400});

    // 10- Check if the coupon isfixed then calculate total price using coupon amount as fixed price
    if(coupon?.isFixed&&coupon)totalPrice=shippingPrice-coupon.couponAmount;

    // 11- Check if the coupon is percentage then calculate total price using coupon amount as percentage
    else if(coupon?.isPercentage)totalPrice=shippingPrice-(shippingPrice*(coupon.couponAmount/100));

    // 12- Create order status assign order status as placed if payment method is cash
    let orderStatus;
    if(paymentMethod=='Cash')orderStatus='Placed';

    // 13- Create order object
    const orderObject={user,orderItems,shippingAddress:{address,city,postalCode,country},phoneNumbers,shippingPrice,coupon:coupon?._id,totalPrice,paymentMethod,orderStatus};

    // 14- Create order using the order object into the database
    const order=await createDocumnetByCreate(Order,orderObject);

    // 15- If the order is not created successfully return error
    if(!order.success)return next({message:'Order creation faild',status:500});

    // 16- Update the stock of each product in the order
    order.createDocument.orderItems.forEach(async item=>{

        // 16.1- Find the product by the product id
        const product=await findDocumentByFindById(Product,item.product);

        // 16.2- Update the stock of the product in the database by subtracting the quantity of the product
        product.isDocumentExists.stock-=item.quantity;

        // 16.3- Save the product in the database
        await product.isDocumentExists.save();
    });

    // 17- Check if the coupon is not null and increase the usage count of the couponuser in the database
    if(coupon){

        // 17.1- Find the coupon user by the coupon id and user id
        const userCoupon=await findDocumentByFindOne(CouponUsers,{couponId:coupon._id,userId:user});

        // 17.2- Increase the usage count of the coupon user in the database
        userCoupon.isDocumentExists.usageCount+=1;

        // 17.3- Save the coupon user in the database
        await userCoupon.isDocumentExists.save();
    }

    // 18- Delete the user cart from the database
    await deleteDocumentByFindByIdAndDelete(Cart, userCart.isDocumentExists._id);

    // 19- Return success response that the order is created
    res.status(201).json({message:'Order created successfuly', order: order.createDocument})
}

/**
 * @description Deliver order API endpoint
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {import('express').Response.json} JSON response - Returns success response that the order is delivered
 * 
 * @throws {Error} If the order is not found
 * @throws {Error} If the order is not placed
 * @throws {Error} If the order is not delivered
 */
export const deliverOrderAPI=async(req,res,next)=>{

    // 1- Destructuring order id from the request params
    const{orderId}=req.params;

    // 2- Destructuring the delivered by from the request authUser
    const{_id:deliveredBy}=req.authUser;

    // 3- Update the order status in the database using the order id and order status as delivered and delivered at and delivered by
    const order=await updateDocumentByFindOneAndUpdate(Order,{_id:orderId,orderStatus:'Placed'},{orderStatus:'Delivered',isDelivered:true,deliveredAt:DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),deliveredBy},{new:true});

    // 4- Check if the order is updated successfully if not return error
    if(!order.success)return next({message:'Fail to deliver please check order status', status:404});
    
    // 5- Return success response that the order is delivered 
    res.status(200).json({message:'Order delivered successfully',order:order.updateDocument})
}

// ================ Order payment with stripe API ================
/**
 * @description Pay with stripe API endpoint role
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {import('express').Response.json} JSON response - Returns success response that the order is paid
 * 
 * @throws {Error} If the order is not found
 * @throws {Error} If the order coupon is not valid
 */
export const payWithStripeAPI=async(req,res,next)=>{
    
    // Extract order id from the request params
    const {orderId}=req.params;
    
    // Extract userId from the request authUser
    const{_id:userId}=req.authUser;

    // Find the order in the database using the order id and user id and order status as pending
    const order=await findDocumentByFindOne(Order,{_id:orderId,user:userId,orderStatus:'Pending'});
    
    // Check if the order is found if not return error
    if(!order.success) return next({message:'Order not fount or cannot be paid',cause:404});

    // Construct the order object for stripe
    const paymentObject={customer_emil:req.authUser.email,metadata:{orderId:order.isDocumentExists._id.toString()},discounts:[],line_items:order.isDocumentExists.orderItems.map(item=>{return{price_data:{currency:'EGP',product_data:{name:item.title},unit_amount:item.price*100},quantity:item.quantity}})};

    // check coupon
    if(order.isDocumentExists.coupon) {

        // Create stripe coupon 
        const stripeCoupon=await createStripeCoupon({couponId:order.isDocumentExists.coupon});
        
        // Check the created stripe coupon if not valid return error
        if(stripeCoupon.status) return next({message:stripeCoupon.message,cause:400});

        // Add the coupon to the payment object
        paymentObject.discounts.push({coupon:stripeCoupon.id})
    }

    // Create checkout session with the payment object
    const checkoutSession=await createCheckoutSession(paymentObject);

    // Create payment intent with the amount and currency
    const paymentIntent=await createPaymentIntent({amount:order.isDocumentExists.totalPrice,currency:'EGP'});

    // Update the order in the database using the payment intent id
    order.isDocumentExists.payment_intent=paymentIntent.id;

    // Save the order in the database
    await order.isDocumentExists.save();

    // Send success reponse with chekout session and payment intent
    res.status(200).json({checkoutSession,paymentIntent});
}

//================= apply webhook locally toconfirm the order ========================
/**
 * @description Stripe web hook locally toconfirm the order with stripe and confirm payment for the order API Endpoin
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {import('express').Response.json} JSON response - That the webhooked recieved
 * 
 * @throws {Error} if the order is not found
 */
export const stripeWebhookLocalAPI=async (req,res,next)=>{
    
    //  Ectract the order id from the metadata order id
    const orderId=req.body.data.object.metadata.orderId;

    // Find the order in the database
    const confirmedOrder=await findDocumentByFindById(Order,orderId)
    
    // If the order is not found return error
    if(!confirmedOrder.success) return next({message:'Order not found',cause:404});

    // Confiorm the payment intent for the order  
    const confirmPaymentIntentDetails=await confirmPaymentIntent({paymentIntentId:confirmedOrder.isDocumentExists.payment_intent});
    
    // Log the details of the confirmed payment intent
    console.log({confirmPaymentIntentDetails});

    // Update the order in the database is paid to true 
    confirmedOrder.isDocumentExists.isPaid=true;

    // Update the order in the database with the paid at date now
    confirmedOrder.isDocumentExists.paidAt=DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');

    // Update the order in the database with the order status as paid
    confirmedOrder.isDocumentExists.orderStatus='Paid';

    // Save the order in the database 
    await confirmedOrder.isDocumentExists.save();

    // Send succes response with status 200 and send a JSON response with a success message that the webhook is recieved
    res.status(200).json({message:'webhook received'});
}

/**
 * Refund the order API endpoint
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {import('express').Response.json} JSON response - Returns success response that the order is refunded
 * 
 * @throws {Error} If the order is not found or cannot be refunded
 */
export const refundOrderAPI=async (req,res,next)=>{

    // Extract the order id from the request parameters
    const{orderId}=req.params;

    // Find the order in the database using the order id and order status as paid and user as the auth user
    const findOrder=await findDocumentByFindOne(Order,{_id:orderId,orderStatus:'Paid',user:req.authUser._id});

    // Check if the order exitst in the database if not return an error 
    if(!findOrder.success) return next({message:'Order not found or cannot be refundded',cause:404});

    // Refund the payment intents for the order usein the payment intent id
    const refund=await refundPaymentIntent({paymentIntentId:findOrder.isDocumentExists.payment_intent});

    // Update the order Status in the databse to Refunded
    findOrder.isDocumentExists.orderStatus='Refunded';
    
    // Save the order in the databasse
    await findOrder.isDocumentExists.save();

    // Return success response that the order is refunded
    res.status(200).json({message:'Order Refunded successfully',order:refund});
}

/**
 * Cancel order with in one day duaration API endpoint
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response.json} JSON response - Send success response that the ordered is canceleed successfully
 * 
 * @throws {Error} If the order is not found
 * @throws {Error} if the order cannot be canceled after one day
 */
export const cancelOrderWithInOneDayAPI=async(req,res,next)=>{

    // Extract the orderid from the request parameters
    const {orderId}=req.params;

    // Extract user id from the request auth user
    const {_id:userId}=req.authUser;

    // Find the order to be canceled using user id and order id using find by one method from order collection in the database
    const canceldOrder=await findDocumentByFindOne(Order,{_id:orderId,user:userId}); 

    // If order is not found retuirn an erroo rthar ther order doesn' t exist
    if(!canceldOrder.success) return next({message:'Order not found',cause:404});

    // Create the current time
    const currentTime=DateTime.now();

    // Caclucltae the days differences between the  cancledrder created by and the cuurent date
    const timeDifference=currentTime.diff(DateTime.fromJSDate(canceldOrder.isDocumentExists.createdAt),'days').toObject().days;

    // If the days time differences is greater than one day than return an error that order cannot be canceled after one day
    if(timeDifference>1) return next({message:'Order cannot be cancled after one day', cause:400});

    // Update the order status to canceled
    canceldOrder.isDocumentExists.orderStatus='Canceled';

    // Update the order canceled by to userId
    canceldOrder.isDocumentExists.canceledBy =userId;

    // Update the order canceldta to the current date
    canceldOrder.isDocumentExists.cancelledAt = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');

    // Save the canceled order in the order collection in the database
    await canceldOrder.isDocumentExists.save();

    // Send success response that the order canceled successfully \
    res.status(canceldOrder.status).json({message:'Order canceled successfully', order:canceldOrder.isDocumentExists});

}