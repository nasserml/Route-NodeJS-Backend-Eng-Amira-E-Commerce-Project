import Joi from 'joi';
import { systemRoles } from '../../utils/systemRoles.js';
import { generalRules } from '../../utils/general.validation.rule.js';

// Schema validation for add product API endpoint
export const addProductSchema = {
    query: Joi.object({categoryId:generalRules.dbId , subCategoryId: generalRules.dbId, brandId:generalRules.dbId}).and('categoryId', 'subCategoryId', 'brandId')
}

export const updateProductSchema = {
    params: Joi.object({productId: generalRules.dbId}).required()
}

export const getProductWithReviewsSchema={
    query:Joi.object({productId:generalRules.dbId.required()})
}