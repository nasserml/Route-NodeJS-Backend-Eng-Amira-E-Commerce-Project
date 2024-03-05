import Cart from '../../../DB/models/cart.model.js';
import { deleteDocumentByFindByIdAndDelete, findDocumentByFindOne } from '../../../DB/dbMethods.js';

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
        const added = await pushNewProduct(userCart, product, quantity);

        // 8.2- Check if the product is added to the cart if not return an error
        if(!added) return next({ message: 'Product not added to cart', cause: 400});
    }

    // 9- Send successful response with the updated cart
    res.status(200).json({ message: 'Product added to cart successfully', data: userCart });
}

// =========================== Remove product from the cart ===============================
/**
 * @param {productId} from req.params
 * @param {userId} from req.authUser
 * @description Update the cart by removing the specified product from the user's cart.
 * @returns Success resrespone that the product is removed from the cart
 * 
 * @throws 404 - If the product not found in the cart
 * @throws 500 - If any error occurs while removing the product
 * 
 */
export const removeProductFromCartAPI = async (req, res, next) => {

    // 1- Destructuring the productId from the request params
    const { productId} = req.params;

    //  2- Destructuring the userID from the request authUser
    const { _id} = req.authUser;

    // 3- Get the user's cart based on the userID and the productId
    const userCart = await findDocumentByFindOne(Cart, { userId: _id, 'products.productId': productId});

    // 4- IF either the user has no cart or the product not found in the cart return an error 
    if(!userCart.success) return next({ message : 'Product not found in cart', cause: 404 });

    // 5- Remove the product from the cart based on the productId
    userCart.isDocumentExists.products = userCart.isDocumentExists.products.filter( product => product.productId.toString() !== productId  );

    // 6- Update the subtotal in the cart
    userCart.isDocumentExists.subTotal = calculateSubTotal(userCart.isDocumentExists.products);

    // 7- Save the cart
    const newCart = await userCart.isDocumentExists.save();

    // 8- If the cart is empty delete it 
    if(newCart.products.length === 0) await deleteDocumentByFindByIdAndDelete(Cart, newCart._id);

    // 9- Send successful response that the product is removed from the cart
    res.status(201).json( { message: 'Product delete from the cart successfully' } );
}


//======================== Another way to make the add to cart API more efficient ===============================

export const addProductToCartEnhanceAPI = async (req, res, next) => {

    const { productId, quantity } = req.body;

    const { _id } = req.authUser;

    const product = await checkProductAvailability(productId, quantity);

    if(!product) return next({ message : 'Product not found or not available', cause: 404 } );

    const userCart =  await getUserCart(_id);

    if(!userCart) {

        const newCart = await addCart(_id, product, quantity);

        return res.status(201).json( { message: 'Product added to cart successfully', data: newCart });
    }

    let newCartProducts = await updateProductQuantityV2(userCart, productId, quantity );

    if(!newCartProducts) newCartProducts = await pushNewProductV2( userCart, product, quantity );

    userCart.products = newCartProducts;

    userCart.subTotal = calculateSubTotal( userCart.products );

    await userCart.save();

    res.status(201).json( { message: 'Product added to cart successfully', data: userCart } );
}