import { Repository } from "../db/dbFunction";
import { dbFunctionsInterface } from "../db/dbFunctionInterface";
import { UserPermissionModel } from "../models/UserPermission";

export class UserPermissionService {
    dbSequelize: dbFunctionsInterface<any>
    constructor(sequelize) {
        let permission = UserPermissionModel.UserPermission(sequelize)
        let repoFunction = Repository(sequelize);
        this.dbSequelize = repoFunction;
    }

}