import { UtilityObject } from '../utils/utils';
import * as uuid from 'uuid';
export function BodyObjectToModelForUpsert(bodyData: any) {

    let model: any = {
        guid: UtilityObject.isGuid(bodyData.UserRoleId) == false || bodyData.UserRoleId == undefined ? uuid.v4() : bodyData.UserRoleId,
        name: bodyData.Name,
        userid: bodyData.UserId,
        issystemadmin: bodyData.IsSystemAdmin

    };

    return model;
}
