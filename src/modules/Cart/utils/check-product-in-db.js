import Product from '../../../../DB/models/product.model.js';

/**
 * @param {String} productId 
 * @param {Number} quantity 
 * @returns {Promise<Product | null>}
 * @description check if the product exists and if it is available
 */
export async function checkProductAvailability( productId, quantity) {

    // 1- Find the product in the database by the product id
    const product = await Product.findById(productId);

    // 2- Check if the product exists and if it is availabe if not return null
    if(!product || product.stock < quantity) return null;

    // 3- Return the product
    return product;
}