import { systemRoles } from '../../utils/systemRoles.js';

export const endPointsRoles = {
    ADD_SUB_CATEGORY: [systemRoles.SUPER_ADMIN],
    UPDATE_SUB_CATEGORY: [systemRoles.SUPER_ADMIN],
    DELETE_SUB_CATEGORY:[systemRoles.SUPER_ADMIN]

}