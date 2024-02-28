import { systemRoles } from "../../utils/systemRoles.js";

export const endPointsRoles = {
    UPDATE_USER: [systemRoles.SUPER_ADMIN, systemRoles.ADMIN, systemRoles.USER],
    DELETE_USER: [systemRoles.SUPER_ADMIN, systemRoles.ADMIN, systemRoles.USER],
    GET_USER_PROFILE_DATA: [systemRoles.SUPER_ADMIN, systemRoles.ADMIN, systemRoles.USER]
}