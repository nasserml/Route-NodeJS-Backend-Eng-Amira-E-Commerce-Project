import Joi from "joi";
import { systemRoles } from "../../utils/systemRoles.js";

// Schema for validating sign up API Endpoint
export const signUpSchema = {
    body: Joi.object({
        username: Joi.string().min(2).required().messages({'any.required': 'Username is required'}),
        email: Joi.string().email().required().messages({'any.required': 'Email is required'}),
        password: Joi.string().required().messages({'any.required': 'Password is required'}),
        cpass: Joi.string().valid(Joi.ref('password')).messages({'any.only': 'Password does not macth'}),
        age: Joi.number().min(13).max(120).required().messages({'any.required': 'Age is required'}),
        role: Joi.string().valid(systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN).required().messages({'any.required': 'Role is required'}),
        phoneNumbers: Joi.array().items(Joi.string()).required().messages({'any.required': 'Phone numbers are required'}),
        addresses: Joi.array().items(Joi.string()).required().messages({'any.required': 'Addresses are required'})
    }).with('password', 'cpass')
};

// Schema for validating login API Endpoint
export const loginSchema = {
    body:Joi.object({
        email: Joi.string().email().required().messages({'any.required': 'Email is required'}),
        password: Joi.string().required().messages({'any.required': 'Password is required'})
    })
};

export const forgetPasswordSchema={
    body:Joi.object({email:Joi.string().email().required()})
}

export const resetPasswordSchema={
    body:Joi.object({newPassword:Joi.string().required()}),
    params:Joi.object({token:Joi.string().required()})
}

export const loginWithGmailSchema={
    body:Joi.object({idToken:Joi.string().required()})
}

export const signUpWithGmailSchema={
    body:Joi.object({idToken:Joi.string().required()})
}