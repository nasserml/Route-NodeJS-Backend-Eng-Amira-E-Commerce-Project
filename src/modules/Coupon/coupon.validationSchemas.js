import Joi from 'joi';
import { generalRules } from '../../utils/general.validation.rule.js';

// Schema validation for get coupon API endpoint
export const addCouponSchema = {
    body: Joi.object({
        couponCode: Joi.string().required().min(3).max(30).alphanum(),
        couponAmount: Joi.number().required().min(1),
        isFixed: Joi.boolean(),
        isPercentage: Joi.boolean(),
        fromDate: Joi.date().greater( Date.now()-(24*60*60*1000) ).required(),
        toDate: Joi.date().greater( Joi.ref('fromDate') ).required(),
        Users: Joi.array().items( Joi.object( {
            userId: generalRules.dbId.required(),
            maxUsage: Joi.number().required().min(1) } ) ).required()
    })
}

// Schema validation for apply coupon api 
export const applyCouponSchema = {
    body: Joi.object({
        couponCode: Joi.string().required().min(3).max(30).alphanum()
    })
}

export const disableCouponSchema={
    params:Joi.object({couponId:generalRules.dbId.required()})
}

export const enableCouponSchema={
    params:Joi.object({couponId:generalRules.dbId.required()})
}

export const getCouponByIdSchema={
    params:Joi.object({couponId:generalRules.dbId.required()})
}