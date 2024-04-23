import Joi from 'joi';
import { generalRules } from '../../utils/general.validation.rule.js';

export const addReviewSchema={
    body:Joi.object({reviewRate:Joi.number().min(1).max(5).required(),reviewComment:Joi.string().min(5).max(255).optional()}),
    query:Joi.object({productId:generalRules.dbId.required()})
}

export const deleteReviewSchema={
    params:Joi.object({reviewId:generalRules.dbId.required()})
}

export const getAllReviewsProductSchema={
    params:Joi.object({productId:generalRules.dbId.required()})
}