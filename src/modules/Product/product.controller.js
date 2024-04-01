import slugify from 'slugify';

import Brand from '../../../DB/models/brand.model.js';
import Product from '../../../DB/models/product.model.js';
import ProductSocketIOTest from '../../../DB/models/product-socketIO-test.model.js';
import {createDocumnetByCreate, findDocumentByFindById} from '../../../DB/dbMethods.js';
import {systemRoles} from '../../utils/systemRoles.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
import generateUniqueString from '../../utils/generate-Unique-String.js';
import {APIFeatures} from '../../utils/api-features.js';
import { getIO } from '../../utils/io-generation.js';

//================== Add product API ======================
/**
 * Add product API endpoint to create new product in the date base
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res  - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Returns success response that the product is added.
 * 
 * @throws {Error} If the Brand not found.
 * @throws {Error} If the brand not found in this category.
 * @throws {Error} If the brand not found in this sub-category.
 * @throws {Error} If the user not authorized to add the product for the brand.
 * @throws {Error} If the image is not sent.
 * @throws {Error} If the product is not created in the database.
 */
export const addProductAPI = async (req, res, next) => {
    // 1- Destructuring the title, desc, baseprice, discount, stock and specs data from the request body
    const { title, desc, basePrice, discount, stock, specs} = req.body;

    // 2- Destructuring the category, and subcategory and brand ids from the request query
    const {categoryId, subCategoryId, brandId} = req.query;

    // 3- Destructuring the added by from request auth user id
    const addedBy = req.authUser._id;

    // 4- Check if the brand exists
    const brand = await findDocumentByFindById(Brand, brandId);

    // 5- If the brand doesnot exist return an error
    if(!brand.success) return next({ cause: 404, message:'Brand not found'});

    // 6- Check if the brand exists in the category if not return an error
    if(brand.isDocumentExists.categoryId.toString() !== categoryId) return next({cause:400, message:'Brand not found in this category'});

    // 7- Check if the brand exists in the sub-category if not return an error
    if(brand.isDocumentExists.subCategoryId.toString() !== subCategoryId) return next({ cause: 400, message: 'Brand not found in this sub-category'});

    // 8- Check if the user is authorized to add the product for the brand if not return an error
    if (req.authUser.role !== systemRoles.SUPER_ADMIN && brand.isDocumentExists.addedBy.toString() !== addedBy.toString()) return next({cause: 403, message: 'You are not authorized to add a product for this brand'})

    // 9- Slugifying the title
    const slug = slugify(title, {lower: true, replacement:'-'});

    // 10- Calculate the apllied price
    const appliedPrice = basePrice - (basePrice * (discount || 0) / 100);

    // 11- Check if the image is sent if not return an error
    if(!req.files?.length) return next({ cause : 400, message : 'Image are required'});

    // 12- Initialize the images array
    const Images = [];

    // 13- Generate the folder unique id
    const folderId = generateUniqueString(4);

    // 14- Create folder path for the images
    const folderPath = brand.isDocumentExists.Image.public_id.split(`${brand.isDocumentExists.folderId}`)[0];

    // 15- Loop through the images and upload them to cloudinary
    for (const file of req.files) {

        // 15.1- Upload each image to cloudinary and destuct the secure_url and the public id
        const { secure_url, public_id} = await cloudinaryConnection().uploader.upload(file.path, { folder: folderPath + `${brand.isDocumentExists.folderId}/Products/${folderId}`});
        
        // 15.2- Push the secure_url and public_id to the images array
        Images.push({ secure_url, public_id});
    }

    // 16- Create folder in the request for roll back uploaded documents in the middleware
    req.folder = folderPath + `${brand.isDocumentExists.folderId}/Products/${folderId}`;

    // 17- Create product object
    const product = {title, desc, slug, basePrice, discount, appliedPrice, stock, specs: JSON.parse(specs), categoryId, subCategoryId, brandId, addedBy, Images, folderId};

    // 18- create product in the database
    const newProduct = await createDocumnetByCreate(Product, product);

    // 19- Create saveDocuments in the request for roll back saved documents middleware
    req.saveDocuments = {model: Product, _id: newProduct.createDocument._id};

    // 20- Send the response indicating the success of creating product
    res.status(newProduct.status).json({success: newProduct.success, message: 'Product created successfully', data: newProduct});
}

//================================== Update product api ==========================
/**
 * Update product API endpoint 
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Returns success response that the product is updated succcessfully.
 * 
 * @throws {Error} If the product not found.
 * @throws {Error} If the user is not authorized to update this product.
 * @throws {Error} If the image is not sent.
 * @throws {Error} If the product not updated in the database.
 */
export const updateProductAPI = async (req, res, next) => {

    // 1- Destructuring the title, desc, specs, stock, basePrice, discount and oldPublicId from request body
    const { title, desc, specs, stock, basePrice, discount, oldPublicId} = req.body;

    // 2- Destructuring the productid from request parmas
    const {productId} = req.params;

    // 3- Destructuring the id od the auth user as addedby from the request authUser
    const addedBy = req.authUser._id;
    
    // 4- Find the product in the product collection in the database
    const product = await findDocumentByFindById(Product, productId);

    // 5- Check if the product exists in the database otherwise return an error
    if(!product.success) return next({message: 'Product not found', cause: 404});
    
    // 6- Check if the user is authorized to update the product if not return an error
    if (req.authUser.role !== systemRoles.SUPER_ADMIN && product.isDocumentExists.addedBy.toString() !== addedBy.toString()) return next({message: 'You are not authorized to update this product', cause: 403});

    // 7- Check if the title is sent
    if (title) {
        // 7.1- Update the title in the product
        product.isDocumentExists.title = title;

        // 7.2- Slugifying the title and updated to the product
        product.isDocumentExists.slug = slugify(title, {lower: true, replacement: '-'});
    }
    
    // 8- Check if the desc is sent 
    if (desc) product.isDocumentExists.desc = desc; // 8.1- Update the desc in the product
    
    // 9- Check if the specs is sent
    if (specs) product.isDocumentExists.specs = JSON.parse(specs); // 9.1- Update the specs in the product

    // 10- Check if the stock is sent
    if (stock) product.isDocumentExists.stock = stock; // 10.1- Update the product stock in the database

    // 11- Calculate the applid price from the basePrice and discount fron the old ones or the new ones
    const appliedPrice = (basePrice || product.isDocumentExists.basePrice) * ( 1 - ((discount || product.isDocumentExists.discount) / 100))

    // 12- Update the applied price in the product in the databsae
    product.isDocumentExists.appliedPrice = appliedPrice;

    // 13- Check if the basePrice isent
    if (basePrice) product.isDocumentExists.basePrice = basePrice; // 13.1- Update the base price in the product

    // 14- Check if the discount is sent
    if (discount) product.isDocumentExists.discount = discount; // 14.1- Update the discount in the product 

    // 15- Check if the old public id is sent
     if (oldPublicId) {

        // 15.1- Check if the image is sent otherwise return an error
        if (!req.file) return next({message: 'Please select a new image', cause: 400});

        // 15.2- Create folder path for the image
        const folderPath = product.isDocumentExists.Images[0].public_id.split(`${product.isDocumentExists.folderId}`)[0];

        // 15.3- Calculate the new public id from old public id
        const newPublicId = oldPublicId.split(`${product.isDocumentExists.folderId}/`)[1];

        // 15.4- Upload the new image to cloudinary and overwrite the old image
        const {secure_url, public_id} = await cloudinaryConnection().uploader.upload(req.file.path, {folder: folderPath + `${product.isDocumentExists.folderId}`, public_id: newPublicId});

        // 15.5- Update the secure url for the image in the product
        product.isDocumentExists.Images.map((img) => {if(img.public_id === oldPublicId) img.secure_url = secure_url});

        // 15.6- Create folde in the request for the troll back uploaded files middleware
        req.folder = folderPath + `${product.isDocumentExists.folderId}`;

     }

     // 16- Save the updated product in the database
     await product.isDocumentExists.save();

     // 17- Send success response that the product updated successfully
     res.status(product.status).json({success: product.success, message: 'Product updated successfully', data: product});
}

// =============================== Get All product API ==================================
/**
 * Get all product API endpoints using pagination and sort and search
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Returns success response that the products found with products
 */
export const getAllProductsAPI = async ( req, res, next) => {

    // 1- Destructuring the page, size, sort and search from the request query
    const { page, size, sort, ...search} = req.query;

    // 2- Create featrues for find and filters based on the search
    const features = new APIFeatures(req.query, Product.find()).filters(search);

    // 3- Get all the products based on the filters
    const products = await features.mongooseQuery;

    // 4- Return success response with the founded data
    res.status(200).json({ success: true, data: products});
}

/**
 * Add product API endpoint using SocketIO 
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Returns success response that the product is added.
 */
export const addProductUsingSocketIOTestAPI=async(req,res,next)=>{

    console.log('addProductUsingSocketIOTestAPI endpoint logged');

    // Destructuring the title, basePrice, and stock from the request body
    const{title,basePrice,stock}=req.body;

    // create a new product object
    const product={title,basePrice,stock};

    // Create the new product in the daqtabase using the create findtion
    const newProduct=await createDocumnetByCreate(ProductSocketIOTest,product);

    // Add the new product in the response's saveDpcoments object
    res.saveDocuments={model:Product,_id:newProduct._id};

    // Emit the new product event to all the connected clients with the new product
    getIO().emit('new-product',newProduct);

    // Return success json response with the new product
    res.status(newProduct.status).json({success:newProduct.success,message:'Product created successfully',data:newProduct.createDocument})
}
/**
 * Get all products API endpoint using SocketIO 
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Returns success response with all products
 */
export const getAllProductUsingSocketIOTestAPI=async(req,res,next)=>{

    // Setruct the page and she siae and the search from the request query
    const {page,size,...search}=req.query;

    // Create features for find and filters
    const features=new APIFeatures(req.query,ProductSocketIOTest.find()).filters(search);

    // Get all the products based on the filters
    const products = await features.mongooseQuery;

    // Emit the all products event to all the connected clients with the products
    getIO().emit('all-products',products);

    // Return success json response with the products
    res.status(200).json({success:true,data:products})
}

/**
 * Get product bu id with its reviews API endpoint.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res  - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Returns success response that the product with its reviews
 */
export const getProductReviewsAPI=async(req,res,next)=>{
    
    // Destructuring the productId from the request query
    const {productId}=req.query;

    // Find by id the prudct and populate the reviews virtual field with the reviews
    const productWithReviews=await Product.findById(productId).populate([{path:'Reviews'}]);
    
    // Sendsuccessful json response with the product object with its Reviews
    res.status(200).json({message:'Done', productWithReviews})
}
