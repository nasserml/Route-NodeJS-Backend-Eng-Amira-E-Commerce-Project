import mongoose from 'mongoose';
import { systemRoles } from '../../src/utils/systemRoles.js';
import bcrypt from 'bcrypt';

/**
 * Mongoose Schema definition for the user collection in the database
 * 
 * @typedef {mongoose.Schema} userSchema
 * @property {string} username - The username of the user. Must be required and lowercase and trimmed. Minimum length is 3 and maximum length is 20.
 * @property {string} email - The email of the user. Must be required and unique and lowercase and trimmed.
 * @property {string} password - The password of the user. Must be required and minimum length is 8.
 * @property {Array<Object>} phoneNumbers - The phoneNumbers of the user. Must be required
 * @property {string} addresses - The addresses of the user. Must be required
 * @property {string} role - The role of the user. Default is USER
 * @property {boolean} isEmailVerified - The isEmailVerified of the user. Default is false
 * @property {boolean} isLoggedIn - The isLoggedIn of the user. Default is false
 * @property {number} age - The age of the user. Minimum is 18 and maximum is 100.
 * @property {Date} createdAt - The date and time when the user was created.
 * @property {Date} updatedAt - The date and time when the user was last updated.
 */
const userSchema = new mongoose.Schema({

    /** String */
    username: {type: String, required: true, minlength: 3, maxlength: 20, tirm: true, lowercase: true},
    email: {type: String, required: true, unique: true, tirm: true, lowercase: true},
    password: { type: String, required: true, minlength: 8,},
    phoneNumbers: [{ type: String, required: true,}],
    addresses: [{ type: String, required: true}],
    role: { type: String, enum: Object.values(systemRoles), default: systemRoles.USER},
    token: String,
    forgetCode:String,
    profilePicture:{secure_url:String,public_id:String},
    
    /** Boolean */
    isEmailVerified: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false},

    /** Number */
    age: { type: Number, min: 18, max: 100},
    
},{timestamps: true});

// Hook to hash password before saving 
// userSchema.pre('save',function(next,hash){

//     this.password=bcrypt.hashSync(this.password,+process.env.SALT_ROUNDS);
//     next();
// })

/**
 * Exports the user model to be used 
 */
export default mongoose.models.User || mongoose.model('User', userSchema)