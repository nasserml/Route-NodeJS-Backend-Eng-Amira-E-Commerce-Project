import { deleteDocumentByFindByIdAndDelete } from "../../DB/dbMethods.js";

/**
 * Middleware to rollback saved documents
 * 
 * @param {import('express').Request} req - Express request object. 
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 */
export const rollbackSavedDocuments = async (req, res, next) => {

    /**
     * @description delete the saved documents from the database if the request failed
     * @param {object} { model, _id} - The saved documents
     */
    // Log the rollbackSavedDocuments middleware
    console.log('rollbackSavedDocuments middleware');

    // Che if there are any saved documents in the request object
    if(req.savedDocuments) {

        // Log the saved documents
        console.log(req.savedDocuments);

        // Destructure the model and _id from the saved documents
        const {model, _id} = req.savedDocuments;

        // Delete the document from the database using the 'findByIdAndDelete' method
        await deleteDocumentByFindByIdAndDelete(model, _id);
    }
}