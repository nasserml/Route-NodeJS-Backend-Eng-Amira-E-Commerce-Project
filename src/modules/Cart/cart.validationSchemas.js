import Joi from 'joi';

import { systemRoles } from '../../utils/systemRoles.js';
import { generalRules } from '../../utils/general.validation.rule.js';

// Schema validation dor add product to cart API endpoint
export const addProductToCartSchema = {
    body: Joi.object({
        productId: generalRules.dbId,
        quantity: Joi.number().min(1).required()
    }).and('productId', 'quantity')
}