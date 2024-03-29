import{systemRoles}from'../../utils/systemRoles.js';

export const endPointsRoles={
    CREATE_ORDER:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.USER],
    CONVERT_FROM_CART_TO_ORDER:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.USER],
    DELIVER_ORDER:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.USER],
    STRIPE_PAY:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.USER],
    REFUND_ORDER:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN]
}