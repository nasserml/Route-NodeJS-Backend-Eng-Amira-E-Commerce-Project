import {systemRoles} from '../../utils/systemRoles.js';

export const endPointsRoles={
    ADD_REVIEW:[systemRoles.SUPER_ADMIN,systemRoles.ADMIN,systemRoles.ADMIN],
    DELETE_REVIEW:[systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.USER]
}