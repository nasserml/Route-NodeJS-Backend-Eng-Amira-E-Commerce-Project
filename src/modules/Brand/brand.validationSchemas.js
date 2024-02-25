import Joi from 'joi';
import { systemRoles } from '../../utils/systemRoles.js';
import { generalRules } from '../../utils/general.validation.rule.js';

// Schema validation for add brand API endpoint
export const addBrandSchema = {
    query: Joi.object({categoryId: generalRules.dbId, subCategoryId: generalRules.dbId}).with('categoryId', 'subCategoryId')
}