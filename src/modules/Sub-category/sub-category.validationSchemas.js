import Joi from 'joi';
import { systemRoles } from '../../utils/systemRoles.js';
import { generalRules } from '../../utils/general.validation.rule.js';

// Schema validation for the add subcategory API endpoint
export const addSubCategorySchema = {
    params: Joi.object({categoryId: generalRules.dbId})
}

// Schema validatrion for the update subcategory API endpoint
export const updateSubCategorySchema = {
    params: Joi.object({subCategoryId: generalRules.dbId}).required()
};

// Schema validation for the delete subcategory API endpoints
export const deleteSubCategorySchema = {
    params: Joi.object({subCategoryId: generalRules.dbId}).required()
}

