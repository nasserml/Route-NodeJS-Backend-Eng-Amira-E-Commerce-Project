import { systemRoles } from '../../utils/systemRoles.js';

export const endPointsRoles = {
    ADD_PRODUCT: [systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
    UPDATE_PRODUCT: [systemRoles.SUPER_ADMIN, systemRoles.ADMIN]
}