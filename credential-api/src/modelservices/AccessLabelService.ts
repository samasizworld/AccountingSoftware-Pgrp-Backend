import { Op } from "sequelize";
import { Repository } from "../db/dbFunction";
import { dbFunctionsInterface } from "../db/dbFunctionInterface";
import { AccessLabelModel } from "../models/AccessLabel";

export class AccessLabelService<T> {
    protected dbSequelize: dbFunctionsInterface<any>;
    constructor(sequelize) {
        let accesslabel = AccessLabelModel.AccessLabel(sequelize)
        let repoFunction = Repository(accesslabel);
        this.dbSequelize = repoFunction;
    }

    async GetAccessLabelAsPerAsUserRole(roleId: string) {
        let include = [
            {
                association: 'permissions',
                required: true,
                where: {
                    datedeleted: null,
                    userrolereference: roleId, [Op.or]: [{ canread: true }, { canwrite: true }]
                }
            }]
        let result = await this.dbSequelize.loadAllOffset(0, 0, 'accesslabelid', 'asc', { datedeleted: null }, include)
        return result;
    }

    async checkAccessLabelPermissionPerRole(roleId: string, accessLabelId: number, action: string) {
        let permissionQuery: any = {
            datedeleted: null,
            userrolereference: roleId,
            accesslabelid: accessLabelId
        };

        if (action == 'GET') {
            permissionQuery.canread = true;
        }
        if (action == 'POST' || action == 'PUT' || action == 'DELETE') {
            permissionQuery.canwrite = true;
        }
        var include = [
            {
                association: 'permissions',
                required: true,
                where: permissionQuery
            }
        ]

        let permissions = await this.dbSequelize.loadAllOffset(0, 0, 'accesslabelid', 'ASC', { datedeleted: null, accesslabelid: accessLabelId }, include);
        return permissions.length > 0;

    }
    async LoadAllWithAttribute(attributes, whereClause) {
        return this.dbSequelize.loadAllWithAttribute(attributes, whereClause)
    }
}