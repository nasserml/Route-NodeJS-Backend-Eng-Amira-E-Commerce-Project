import Joi from 'joi';
import { systemRoles } from '../../utils/systemRoles.js';
import { generalRules } from '../../utils/general.validation.rule.js';

// Schema validation for add brand API endpoint
export const addBrandSchema = {
    query: Joi.object({categoryId: generalRules.dbId, subCategoryId: generalRules.dbId}).with('categoryId', 'subCategoryId')
}

// Schema validation for the delete brand API endpoint
export const deleteBrandSchema = {
    params: Joi.object({brandId: generalRules.dbId}).required()
}

// Schema validation for update brand API endpoint
export const updateBrandSchema = {
    params : Joi.object({brandId: generalRules.dbId}).required()
}