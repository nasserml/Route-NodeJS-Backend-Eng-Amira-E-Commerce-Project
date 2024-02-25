import { systemRoles} from '../../utils/systemRoles.js';


export const endPointsRoles = {
    ADD_CATEGORY: [systemRoles.SUPER_ADMIN],
    UPDATE_CATEGORY: [systemRoles.SUPER_ADMIN],
    DELETE_CATEGORY: [systemRoles.SUPER_ADMIN]
};