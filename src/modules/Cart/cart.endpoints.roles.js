import { systemRoles } from '../../utils/systemRoles.js';

export const endPointsRoles = {
    ADD_PRODUCT_TO_CART: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN, systemRoles.USER],
    REMOVE_PRODUCT_FROM_CART : [systemRoles.ADMIN, systemRoles.SUPER_ADMIN, systemRoles.USER]
}