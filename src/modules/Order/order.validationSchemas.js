import Joi from'joi';
import{generalRules}from'../../utils/general.validation.rule.js';

// Schema validation for create order API endpoint
export const createOrderSchema={
    body:Joi.object({
        product:generalRules.dbId.required(),
        quantity:Joi.number().min(1).required(),
        couponCode:Joi.string().min(3).max(30).alphanum(),
        paymentMethod:Joi.string().valid('Cash', 'Stripe', 'Paymob').required(),
        address:Joi.string().required(),
        city:Joi.string().required(),
        postalCode:Joi.string().required(),
        country:Joi.string().required(),
        phoneNumbers:Joi.array().items(Joi.string().required()).required(),
    })
}

// Schema validation for convert from cart to order API endpoint
export const convertFromCartToOrderSchema={
    body:Joi.object({
        couponCode:Joi.string().min(3).max(30).alphanum(),
        paymentMethod:Joi.string().valid('Cash', 'Stripe', 'Paymob').required(),
        address:Joi.string().required(),
        city:Joi.string().required(),
        postalCode:Joi.string().required(),
        country:Joi.string().required(),
        phoneNumbers:Joi.array().items(Joi.string().required()).required(),
    })
}