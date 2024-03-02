import Cart from '../../../DB/models/cart.model.js';
import {} from '../../../DB/dbMethods.js';

import {addCart} from './utils/add-cart.js';
import {pushNewProduct, pushNewProductV2} from './utils/add-product-to-cart.js';
import { calculateSubTotal } from './utils/calculate-subtotal.js';
import { checkProductAvailability } from './utils/check-product-in-db.js';
import { getUserCart } from './utils/get-user-cart.js';
import { updateProductQuantity, updateProductQuantityV2} from './utils/update-product-quantity.js';

export const addProductToCartAPI = async (req, res, next) => {

    const { productId, quantity} = req.body;

    const { _id } = req.authUser;

    const product = await checkProductAvailability(productId, quantity);

    if(!product) return next({ message: 'Product not found or not available', cause: 404 });

    const userCart = await getUserCart(_id);

    if(!userCart) { 
        const newCart = await addCart(_id, product, quantity); 
        return res.status(201).json({ message: 'Product added to cart successfully', data: newCart })  
    };

    const isUpdated = await updateProductQuantity(userCart, productId, quantity);
    
    if(!isUpdated) { 
        const added = await pushNewProduct(userCart, productId, quantity);

        if(!added) return next({ message: 'Product not added to cart', cause: 400});
    }

    res.status(200).json({ message: 'Product added to cart successfully', data: userCart });
}