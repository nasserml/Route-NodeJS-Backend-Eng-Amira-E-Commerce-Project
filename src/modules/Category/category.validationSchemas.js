import Joi from 'joi';
import { systemRoles } from '../../utils/systemRoles.js';
import { generalRules } from '../../utils/general.validation.rule.js';

// Schema validation for add category API endpoint
export const addCategorySchema = {
    body: Joi.object({
        name: Joi.string().required().messages({'any.required': 'Name is required'})
    })

}

// Schema validation for update category API endpoint
export const updateCategorySchema = {
    params: Joi.object({categoryId: generalRules.dbId})
}

// Schema validation for delete category API endpoints
export const deleteCategorySchema = {
    params: Joi.object({categoryId: generalRules.dbId})
}

export const getAllSubCategoriesForCategorySchema={
    params:Joi.object({categoryId:generalRules.dbId.required()})
}