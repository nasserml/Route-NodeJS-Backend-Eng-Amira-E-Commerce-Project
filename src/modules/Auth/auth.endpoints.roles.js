import {systemRoles} from '../../utils/systemRoles.js';

export const endPointsRoles={
    SOFT_DELETE_USER:[systemRoles.SUPER_ADMIN,systemRoles.ADMIN,systemRoles.USER],
    UPDATE_PASSWORD:[systemRoles.SUPER_ADMIN,systemRoles.ADMIN,systemRoles.USER]
};