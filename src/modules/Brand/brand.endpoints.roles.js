import { systemRoles } from '../../utils/systemRoles.js';


export const endPointsRoles = {
    ADD_BRAND: [systemRoles.SUPER_ADMIN],
    DELETE_BRND: [systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
    UPDATE_BRAND: [systemRoles.SUPER_ADMIN, systemRoles.ADMIN]
}