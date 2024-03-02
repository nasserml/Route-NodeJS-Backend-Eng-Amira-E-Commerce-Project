import Cart from '../../../../DB/models/cart.model.js';

/**
 * @param {String} userId 
 * @param {product} product 
 * @param {Number} quantity 
 * @returns {Promise<Cart>}
 * @description add user's cart in the database
 */
export async function addCart (userId, product, quantity) {
    
    // 1- Create cart object
    const cartObj = {userId, products: [{productId: product._id, quantity, basePrice: product.appliedPrice, title:product.title, finalPrice: product.appliedPrice * quantity  } ], subTotal: product.appliedPrice * quantity };

    // 2- Create a new Cart in the database
    const newCart = await Cart.create(cartObj);
    
    // 3- Return the new cart
    return newCart;
}
