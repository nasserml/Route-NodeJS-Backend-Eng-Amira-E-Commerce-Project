import cloudinaryConnection from "../utils/cloudinary.js";

/**
 * Rollback uploaded files by deleting images from cloudinary if the request failed.
 * 
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 */
export const rollbackUploadedFiles = async (req, res, next) => {
    /**
     * @description delete images from cloudinary if the request failed
     * @param {string} folderPath - The folder path of the images
     */

    // Log the rollbackUploadedFiles middleware
    console.log('rollbackUploadedFiles mioddleware');

    // Check if the request contains a folder path
    if(req.folder) {

        // Log the folder path
        console.log(req.folder);

        // Delete all images with the specified folder path prefix from cloudinary
        await cloudinaryConnection().api.delete_resources_by_prefix(req.folder);

        // Delete the folder itself from cloudinary
        await cloudinaryConnection().api.delete_folder(req.folder);
    }
    
    // Continue to the next middleware
    next();
}