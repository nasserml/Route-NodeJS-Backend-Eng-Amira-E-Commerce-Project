import{systemRoles}from'../../utils/systemRoles.js';

export const endPointsRoles={
    CREATE_ORDER:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.USER],
    CONVERT_FROM_CART_TO_ORDER:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.USER]
}