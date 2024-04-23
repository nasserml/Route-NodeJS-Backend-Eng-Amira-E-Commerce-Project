import { systemRoles  } from '../../utils/systemRoles.js';

export const endpointsRoles = {
    ADD_COUPON : [ systemRoles.ADMIN, systemRoles.SUPER_ADMIN ],
    APPLY_COUPON: [systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.USER],
    DISABLE_COUPON:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.USER],
    ENABLE_COUPON:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.USER],
    GET_ALL_DISABLED_COUPONS:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN],
    GET_ALL_ENABLED_COUPONS:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN]
}