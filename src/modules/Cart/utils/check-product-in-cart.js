/**
 * @param {Cart Type} cart 
 * @param {String} productId 
 * @returns {Promise<Boolean>}
 * @description check if the product exists in cart
 */
export async function checkProductIfExistsInCart( cart, productId) {

    // 1- Check if the product exists in the cart and return true or false
    return cart.products.some( (product) =>  product.productId.toString() === productId );
}