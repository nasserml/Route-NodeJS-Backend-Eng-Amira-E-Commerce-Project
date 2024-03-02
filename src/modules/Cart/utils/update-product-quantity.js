import {calculateSubTotal} from './calculate-subtotal.js';
import { checkProductIfExistsInCart} from './check-product-in-cart.js';

/**
 * @param {Cart type} cart 
 * @param {String} productId 
 * @param {Number} quantity 
 * @returns {Promise<Cart | null}
 * @description Update product quantity, final price and subtotal in cart
 */
export async function updateProductQuantity(cart, productId, quantity) {

    // 1- Check if the product exists in the cart 
    const isProductExistInCart = await checkProductIfExistsInCart( cart, productId);

    // 2- If the product does not exist in the cart return null
    if (!isProductExistInCart) return null;

    // 3- Update the product quntity and final price in the cart 
    cart?.products.forEach( product => { if ( product.productId.toString() === productId ) { product.quantity = quantity; product.finalPrice = product.basePrice * quantity} } );

    // 4- Update the subtotal in the cart
    cart.subTotal = calculateSubTotal( cart.products );

    // 5- Return the updated cart and Save the cart
    return await cart.save();
}

//======================= Version 2 from enhancement ============================
/**
 * @param {Cart type} cart 
 * @param {String} productId 
 * @param {Number} quantity 
 * @returns {Promise<Array>}
 * @description We will remove the saving in the db from here and save from controller
 */
export async function updateProductQuantityV2( cart, productId, quantity ) {

    // 1- Check if the product exists in the cart
    const isProductExistInCart = await checkProductIfExistsInCart( cart, productId );

    // 2- If the product does not exist in the cart return null
    if (!isProductExistInCart) return null

    // 3- Update the product quntity and final price in the cart
    cart?.products.forEach( product => { if ( product.productId.toString() === productId ) { product.quantity = quantity; product.finalPrice = product.basePrice * quantity } }  );

    // 4- Return the updated list of products in the cart
    return cart.products;
}




