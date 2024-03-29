import Stripe from 'stripe';
import Coupon from '../../DB/models/coupon.model.js';
import { findDocumentByFindById } from '../../DB/dbMethods.js';

// Create a checkout session
/**
 * Create a checkout session using Stripe API.
 * 
 * @param {object} options - Object containing customer_email, metadata, discounts and line_items.
 * @returns {object} paymentData - Data of the created payment session.
 */
export const createCheckoutSession=async({customer_email,metadata,discounts,line_items})=>{

    // Initialize the Stripe object with the secret key
    const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);

    // Creata a checkout session usingStripe AP?I with thee recived data, the payment method is set to card, the mode is set to payment, the customer emil is passed as a parameter in the function, meta data is an object hold information about the customer, success_url is the the URL the customer will be redirected after a successful payment, cancel Url is the URL the customer will redirected to after canceling the payment, Dicounts is an array of dixount objects that can be applied the payment, line itens is array of objects that represents the products being purchased
    const paymentData=await stripe.checkout.sessions.create({payment_method_types:['card'],mode:'payment',customer_email,metadata,success_url:process.env.SUCCESS_URL,cancel_url:process.env.CANCEL_URL,discounts,line_items});

    // Return the data of the created payment session
    return paymentData;
}

// Create Stripe coupon
/**
 * Create a stripe coupon based on the pro\vided coupon id. It fetches the coupon details fromj the database.
 * transforms the data into the required format required by stripe, then creates the coupon using stripe API.
 * 
 * @param {object} couponId - Id of the coupon to be used to create the stripe coupon.
 * @returns {object}  The created stripe coupon.
 */
export const createStripeCoupon=async({couponId})=>{
    
    // Find the Coupin in the database based on the procided couponid.
    const findCoupon=await findDocumentByFindById(Coupon,couponId);

    // If the coupon not found return an error message that the coupon is not found
    if(!findCoupon.success) return {status:false,message:'Coupon not found'};

    // Initialize the coupon object
    let couponObject={};

    // Check if the the found coupon has a fixed amount discount and then set the coupon object to the required format
    if(findCoupon.isDocumentExists.isFixed) couponObject={name:findCoupon.isDocumentExists.couponCode,amount_off:findCoupon.isDocumentExists.couponAmount*100,currency:'EGP'};

    // Check if the found coupon has a precentage dicount and then set the coupon object to the required format
    if(findCoupon.isDocumentExists.isPercentage) couponObject={name:findCoupon.isDocumentExists.couponCode,percent_off:findCoupon.isDocumentExists.couponAmount};

    // Initialize the Stripe object with the secret key
    const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create the stripe coupon using the coupon object
    const stripeCoupon=await stripe.coupons.create(couponObject);

    // Return the created stripe coupon
    return stripeCoupon;

}

/**
 * Create a new stripe payment method using the provided token.
 * 
 * @param {object} token - The token used to create the payment method.
 * @returns {object} The created payment method
 */
export const createStripePaymentMethod=async ({token})=>{
    
    // Initialize the Stripe object with its secret key
    const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create a new payment method using the provided token, The type of the payment is card, and the card object hoilds the token usedto create the payment method
    const paymentMethod=await stripe.paymentMethods.create({type:'card',card:{token}});

    // Return the created payment method
    return paymentMethod;
}

/**
 * Create a pyment intent using the procided amount and currency,
 * 
 * @param {number} amount - The amount for the payment intent.
 * @param {string} currency - The currency for the payment intent
 * @returns {object} The created payment intent object
 */
export const createPaymentIntent=async({amount,currency})=>{

    // Initialize the Stripe object with its secret key
    const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create a new Stripe payment using the token tok-visa
    const paymentMetod=await createStripePaymentMethod({token:'tok_visa'});

    // Create a new payment intent using the provided amount and the currency, set automatic payment method to enabled and redirects to never and set the pay ment method id to payument intent
    const paymentIntent=await stripe.paymentIntents.create({amount:amount*100,currency,automatic_payment_methods:{enabled:true,allow_redirects:'never'},payment_method:paymentMetod.id});

    // Return the created payment intent
    return paymentIntent;
}

// retrive a stripe payment intent
/**
 * Retrive a payment intent using the provided paymentIntentId
 * 
 * @param {Object} paymentIntentId -  The id of the payment intent to retrieve.
 * @returns {objetc} The retrieved payment intent object.
 */
export const retrivePaymentIntent=async({paymentIntentId})=>{

    // Initialize the Stripe object with its secret key
    const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);

    // Retrive the payment intent using the provided payment intent id
    const paymentIntent=await stripe.paymentIntents.retrieve(paymentIntentId);

    // Return the retrieved payment intent
    return paymentIntent;
}

// confirm a stripe payment
/**
 * Confirm a payment intent using the provided paymentIntentId
 * 
 * @param {Object} paymentIntentId - The id of the payment intent to confirm.
 * @returns {objetc} The confirmed payment intent object.
 */
export const confirmPaymentIntent=async({paymentIntentId})=>{

    // Initialize the Stripe object with its secret key
    const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);

    // Retrieve the payment intent using the provided payment intent id
    const paymentDetails=await retrivePaymentIntent({paymentIntentId});

    // Confirm the payment intent using the provided payment intent id and the payment method
    const paymentIntent=await stripe.paymentIntents.confirm(paymentIntentId,{payment_method:paymentDetails.payment_method});

    // Return the confirmed payment intent
    return paymentIntent;
}

/**
 * Refund a payment intent using the provided paymentIntentId
 * 
 * @param {Object} paymentIntentId - The id of the payment intent to refund.
 * @returns {object} The refund object.
 */
export const refundPaymentIntent=async({paymentIntentId})=>{

    // Initialize the Stripe object with its secret key
    const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);

    // Refund the payment intent using the provided payment intent id
    const refund=await stripe.refunds.create({payment_intent:paymentIntentId});

    // Return the refund object
    return refund;
}