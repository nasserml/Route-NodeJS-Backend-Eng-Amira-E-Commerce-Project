import Cart from '../../../../DB/models/cart.model.js';

/**
 * @param {String} userId 
 * @returns {Promise<Cart | null>}
 * @description Get the user's cart
 */
export async function getUserCart(userId) {

    // 1- Find the user cart in the database by the use id
    const userCart = await Cart.findOne({ userId});

    // 2- Retutn the user cart
    return userCart;
}