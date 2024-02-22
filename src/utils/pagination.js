

/**
 * Generates limit and skip values based on the given page and size parameters.
 * 
 * @param {object} params - The page and size parameters
 * @param {number} params.page - The page number
 * @param {number} params.size -  The page size
 * 
 * @returns {object} - An object containing the limit and skip values based on sspecific equation
 */
export const paginationFunction = ({ page = 1, size = 2}) => {

    // the required pareamns 
    // Ensure that the page atleast 1
    if ( page < 1 ) page = 1;

    // Ensure that the size at least 2
    if (size < 1) size = 2;

    // Equation 
    // Calculate the limit based on the size
    const limit = +size;

    // Calculate the skip based on the page and the limit
    const skip = (+page -1 ) * limit;

    // Return the limit and skip as an object
    return { limit, skip } ;

}