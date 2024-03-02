import Cart from '../../../DB/models/cart.model.js';
import {} from '../../../DB/dbMethods.js';

import {addCart} from './utils/add-cart.js';
import {pushNewProduct, pushNewProductV2} from './utils/add-product-to-cart.js';
import { calculateSubTotal } from './utils/calculate-subtotal.js';
import { checkProductAvailability } from './utils/check-product-in-db.js';
import { getUserCart } from './utils/get-user-cart.js';
import { updateProductQuantity, updateProductQuantityV2} from './utils/update-product-quantity.js';

//====================== Add product to cart API ========================
/**
 * @param {productId, quantity} from req.body 
 * @param {userID} from req.authUser 
 * @description Add the specified product to the user's cart.
 * @returns The updated cart with the new product added to it or the new cart if the user doesn't have a cart
 * @throws 404 - If the product not found or not available
 * @throws 400 - If the product not added to the cart.
 * @throws 201 - If the product added to cart successfully
 * @throws 500 - If any error occurs
 */
export const addProductToCartAPI = async (req, res, next) => {

    // 1- Destructuring the productId and quantity from the request body
    const { productId, quantity} = req.body;

    // 2- Destructuring the userID from the request authUser
    const { _id } = req.authUser;

    /**
     * @check if the product exists and if it is avaliable
     */
    // 3- Check if the product exists and if it is available
    const product = await checkProductAvailability(productId, quantity);
    
    // 4- If the product not found or not available return an error
    if(!product) return next({ message: 'Product not found or not available', cause: 404 });

    /**
     * @check If the user has a cart
     */
    // 5- Get the user's cart
    const userCart = await getUserCart(_id);

    /**
     * @check if the user has no cartm creaate a new cart and add the product to it
     */
    // 6- If the user doesn't have a cart, create a new cart and add the product to it
    if(!userCart) { 
        // 6-1- Add the product to the cart
        const newCart = await addCart(_id, product, quantity); 

        // 6-2- Return the new cart with the new product
        return res.status(201).json({ message: 'Product added to cart successfully', data: newCart })  
    };
    
    /**
     *  @returns The cart state after modifiying its products array to reflect the updated quantities and subtotals.
     *   @check If the returned value is null, then the product is not found in the cart and it will add it.
     */
    // 7- Update the product quantity and final price in the cart
    const isUpdated = await updateProductQuantity(userCart, productId, quantity);
    
    // 8- check if the product is updated if not add it
    if(!isUpdated) { 

        // 8-1- Add the product to the cart
        const added = await pushNewProduct(userCart, productId, quantity);

        // 8.2- Check if the product is added to the cart if not return an error
        if(!added) return next({ message: 'Product not added to cart', cause: 400});
    }

    // 9- Send successful response with the updated cart
    res.status(200).json({ message: 'Product added to cart successfully', data: userCart });
}