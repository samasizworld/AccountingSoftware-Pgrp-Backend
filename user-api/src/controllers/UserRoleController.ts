import * as log from "../utils/logger";
import { BodyObjectToModelForUpsert } from "../datamapper/UserRoleDataMapper";
import { UserRoleService } from "../modelservices/UserRoleService";
import { UserService } from "../modelservices/UserService";
import { ConnectToPostgres } from "../sequelize/sequelize";

export const UserRoleController = {
    UpsertUserRole: async function (req, res) {
        let sequelize = await ConnectToPostgres();
        let userRoleData: any = req.body;
        let result: any;
        let userRoleService = new UserRoleService(sequelize) as UserRoleService<any>; // type assertion
        let userService = new UserService(sequelize) as UserService<any>;
        let model = BodyObjectToModelForUpsert(userRoleData);
        try {
            let userExists = await userService.LoadOneWithAttribute(['userid'], { datedeleted: null, guid: model.userid })
            if (!userExists) {
                log.logError('No User', 'Error in UserController', 'Upsert UserRole', req.UserReference);
                throw 'No User Found';
            }
            model.userid = userExists.userid
            let userRoleExists = await userRoleService.LoadAllWithAttribute(
                ["userroleid", "issystemadmin", 'userid'],
                { datedeleted: null, issystemadmin: true }
            );
            if (userRoleExists.length >= 1 && model.issystemadmin == true && userRoleExists.find(ur => ur.issystemadmin == true)) { // db ma true xa hamle insert garna lagya ni true xa vane msg print garne
                log.logInfo('There cannot be more than a systemadmin in  whole system', 'Error in UserController', 'Upsert UserRole', req.UserReference);
                return res.status(403).send({ errorMessage: 'Not Allowed' });
            } else {
                let role: any = await userRoleService.LoadOneWithAttribute(['userroleid'], { userid: model.userid, guid: model.guid, datedeleted: null })
                if (role) {
                    result = await userRoleService.Update(model, model.guid)
                } else {
                    result = await userRoleService.Add(model)
                }
            }

            return res.status(201).send({ UserRoleId: result.guid });
        } catch (e) {
            log.logError(e.message, e.stack, 'Upsert UserRole ' + req.url, req.UserReference);
            return res.status(500).send({ message: "Server Error" });
        }
    },
};
