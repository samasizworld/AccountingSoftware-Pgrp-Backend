import { Repository } from "../db/dbFunction"
import { UserRoleModel } from "../models/UserRole"

export const UserRoleService = (sequelize) => {
    let userrole = UserRoleModel.UserRole(sequelize)
    let dbFunction = Repository(userrole);
    return { dbFunction }
}