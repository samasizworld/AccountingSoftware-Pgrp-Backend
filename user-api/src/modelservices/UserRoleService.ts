import { GeneralService } from "./general/GeneralService";
import { UserRoleM } from "../models/UserRole";
import { dbFunctions } from "../db/dbFunction";
export class UserRoleService<T> extends GeneralService<T> {
    protected sequelize: any;
    constructor(context: any) {
        const UserRole = UserRoleM.UserRole(context);
        super(new dbFunctions(UserRole));
        this.sequelize = context;
    }
}