import Stripe from 'stripe';
import Coupon from '../../DB/models/coupon.model.js';

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
