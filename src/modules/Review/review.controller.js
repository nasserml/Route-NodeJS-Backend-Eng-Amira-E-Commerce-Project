import orderModel from '../../../DB/models/order.model.js';
import reviewModel from '../../../DB/models/review.model.js';
import productModel from '../../../DB/models/product.model.js';
import { createDocumnetByCreate, deleteDocumentByFindOneAndDelete, findDocumentByFind, findDocumentByFindById, findDocumentByFindOne } from '../../../DB/dbMethods.js';

//============== Add Review API endpoint=======================
/**
 * Add a review to yjhe product aftrrt checking its valid and delivered and to be valid to be reviewd and rate field to the product API endpoint
 *  
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * 
 * @returns {import('express').Response} JSON response - Success response that th review added successfully with the review object
 * 
 * @throws {Error} - If the product was not delivered or not valid to be reviewed
 * @throws {Error} - If the review was not added in the database
 */
export const addReviewAPI=async (req,res,next)=>{

    // Destructuring the userOd from the request authUser
    const {_id:userId}=req.authUser;

    // Extract the productIdf rom the request query
    const {productId}=req.query;

    // Check if the product is valid to be reviewd and has been delivered
    const isProductValidToBeReviewd=await findDocumentByFindOne(orderModel,{user:userId,'orderItems.product':productId,orderStatus:'Delivered'});

    // If the product is not valid to be reviewd hen send an error
    if(!isProductValidToBeReviewd.success) return next({message:'You should buy the product first',cause:400});

    // Extract the reviewRate and reviewComment from the request body
    const {reviewRate,reviewComment}=req.body;

    // Create the review object with its data
    const reviewObject={userId,productId,reviewComment,reviewRate};

    // Add the review to the database 
    const newReview=await createDocumnetByCreate(reviewModel,reviewObject);

    // If the review was not added successfuleey return an error reponse
    if(!newReview.success) return next({message:'Faild to add the review',cause:500});
    
    // Fidnt he product in the datbase by the productId
    const product=await findDocumentByFindById(productModel,productId);

    // Find all reviews for the product in the database
    const reviews=await findDocumentByFind(reviewModel,{productId});

    // Calculate the rate of the product
    let sumOfRates=0;

    // Loop over the reviews to calculate the rate for the product
    for(const review of reviews.isDocumentExists){

        // Add the rate of the product to the sum of rate
        sumOfRates+=review.reviewRate;
    }

    // Update the product average rate based on the new review added
    product.isDocumentExists.rate=Number(sumOfRates/reviews.isDocumentExists.length).toFixed(2);

    // Save the updated product with the new average rate in the database
    await product.isDocumentExists.save();

    // Send success response indicating the reviews was added successfully
    res.status(newReview.status).json({message:'Review added successfully', review:newReview.createDocument});

}

/**
 * Delete review API endpoint
 * 
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {import('express').Response.json} JSON response -Success response that the review deleted successfully
 * 
 * @throws {Error} If the faid to delete the review or the review is not exist
 */
export const deleteReviewAPI=async(req,res,next)=>{

    // Extract the reviewId from the request params
    const{reviewId}=req.params;

    // Extract user id from the requets auth user
    const{_id:userId}=req.authUser;

    // Delete the review from the review collection ion the database isuing the find on and elete method
    const deleteReview=await deleteDocumentByFindOneAndDelete(reviewModel,{_id:reviewId,userId});

    // If the revikew not exitsts return an error
    if(!deleteReview.success) return next({message:'Review does not exists', cause:404});

    //Send success response that the review is delteted successfully
    res.status(deleteReview.status).json({message:'Review deleted successfully', review:deleteReview.isDeletedDocumentExists});

}
/**
 * Get all reviews for specific product based on its id API endpiont 
 * 
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {import('express').Response.json} JSON response -Return success response with reviews for the product
 * 
 * @throws {Error} If the reviews not found
 */
export const getAllReviewsForProductAPI=async(req,res,next)=>{

    // Extract the product id from the request parameters.
    const{productId}=req.params;

    //Find all reviews for documents this product in the reviews collection in the databace using finb method with the id of the product
    const reviewsProduct=await findDocumentByFind(reviewModel,{productId});

    // If there is no reviews found return an error
    if(!reviewsProduct.success) return next({message:'Reviews not found',cause:404});

    // Send success repons etheat the reviews fetched successfully for the product with the data
    res.status(reviewsProduct.status).json({message:'Reviews fetched successfully',reviews:reviewsProduct.isDocumentExists});
}