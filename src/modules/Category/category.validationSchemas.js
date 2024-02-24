import Joi from 'joi';
import { systemRoles } from '../../utils/systemRoles.js';

// Schema validation for add category API endpoint
export const addCategorySchema = {
    body: Joi.object({
        name: Joi.string().required().messages({'any.required': 'Name is required'})
    })
}