import Joi from 'joi';
import { systemRoles } from '../../utils/systemRoles.js';
import { generalRules } from '../../utils/general.validation.rule.js';

export const addSubCategorySchema = {
    params: Joi.object({categoryId: generalRules.dbId})
}