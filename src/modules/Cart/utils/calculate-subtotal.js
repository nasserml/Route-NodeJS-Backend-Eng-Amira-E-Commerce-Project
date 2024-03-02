/**

 * @param {Array{}} products 
 * @returns {Number}
 * @description Calculate the subTotal of the cart 
 */
export function calculateSubTotal(products) {
    
    // 1- Initialize the subTotal variable to 0
    let subTotal = 0 ;

    // 2- Loop through the products array
    for (const product of products) {
    
        // 2.1- Add the product final price to subtotal
        subTotal += product.finalPrice;
    }

    // 3- Retutn the subtotal
    return subTotal
}