import { calculateSubTotal } from './calculate-subtotal.js';

/**
 * @param {Cart Type} cart 
 * @param {Product Type} product 
 * @param {Number} quantity 
 *
 *  @returns {Promise<Cart}
 * 
 * @description add product to the cart
 */
export async function pushNewProduct(cart, product, quantity) {

    // 1- Add the product to the cart
    cart?.products.push({productId: product._id, quantity: quantity, basePrice: product.appliedPrice, title: product.title, finalPrice: product.appliedPrice * quantity});

    // 2- Calculate the subTotal
    cart.subTotal = calculateSubTotal(cart.products);

    //  3- Save the cart
    return await cart.save();
}

/**
 * @param {Cart Type} cart 
 * @param {Product Type} product 
 * @param {Number} quantity 
 * 
 * @returns {Array} Updated list of products in the cart
 * 
 * @description Add a new product to the cart and returns the updated list of prodyucts in the cart
 */
export async function pushNewProductV2(cart, product, quantity) {

    // 1- Add the product to the cart
    cart?.products.push({productId: product._id, quantity: quantity, basePrice: product.appliedPrice, title: product.title, finalPrice : product.appliedPrice * quantity});

    // 2- Return the updated list of products in the cart
    return cart.products;
}

