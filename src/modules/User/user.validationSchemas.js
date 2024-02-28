import Joi from 'joi';
import { systemRoles } from '../../utils/systemRoles.js';
import { generalRules } from '../../utils/general.validation.rule.js';

// Schema validation for update user API endpoint 
export const updateUserSchema = {
    body: Joi.object({
        username: Joi.string().min(2),
        email: Joi.string().email(),
        oldPassword: Joi.string(),
        newPassword: Joi.string(),
        cpass: Joi.string().valid(Joi.ref('newPassword')),
        age: Joi.number().min(13).max(120),
        phoneNumbers: Joi.array().items(Joi.string()),
        addresses: Joi.array().items(Joi.string())
    }).min(1).with('newPassword', 'cpass')
};

// Schema validation for get user profile API endpoint 
export const getUserProfileDataSchema = {
    params: Joi.object({userId: generalRules.dbId}).required()
};


// getUserProfileDataSchema