import { Repository } from "../db/dbFunction";
import { UserLoginInfoModel } from "../models/UserLoginInfo"
import { UtilityObject } from "../utilities/utils";
import moment from 'moment'
import { UserService } from "./UserService";


export function UserLoginInfoService(context: any) {
    let userlogininfo = UserLoginInfoModel.UserLoginInfo(context);
    let repoFunction = Repository(userlogininfo);

    return {
        GenerateAuthKey: async function (userId: string, authExpiryInSeconds: number, username: string) {
            let userlogininfo = await repoFunction.insert({ userreference: userId });
            let loggedininfoString: any;
            if (username) {
                loggedininfoString = JSON.stringify({ UserLoginInfoId: userlogininfo.guid, UserReference: userlogininfo.userreference, Username: username, TokenExpiresIn: authExpiryInSeconds });

            } else {
                loggedininfoString = JSON.stringify({ UserLoginInfoId: userlogininfo.guid, Userreference: userlogininfo.userreference, TokenExpiresIn: authExpiryInSeconds });
            }
            let token = Buffer.from(loggedininfoString).toString('base64');
            await repoFunction.update({ usertoken: token }, { guid: userlogininfo.guid, datedeleted: null })
            return { authKey: token, UserLoginInfoId: userlogininfo.guid }
        },
        Validate: async function (currentPassword: string, passwordHash: string, salt: string) {

            return passwordHash === UtilityObject.hashPassword(currentPassword, salt);

        },
        checkAuthKeyValidity: async function (UserLoginInfoId: string, authKeyExpiryInSeconds: number) {
            var dateTimeNow = moment().subtract(authKeyExpiryInSeconds, 'seconds').format("YYYY-MM-DD HH:mm:ss");
            let userService = UserService(context);

            const [userlogininfo]: any = await repoFunction.loadAllWithAttribute(['userreference', 'datemodified'], { guid: UserLoginInfoId, datedeleted: null });
            if (!userlogininfo) {
                throw 'No UserLogin Session is found';
            }
            const userDetail: any = await userService.LoadUserWithRole(userlogininfo.userreference);
            if (!userDetail || userDetail.length == 0) {
                return [];
            }
            let checkAuthkeyExpiry = true;
            const assignedRoles = userDetail[0].userroles
            if (assignedRoles.length > 0 && assignedRoles.find(ur => ur.issystemadmin === true)) {
                //no authkey expiry check for systemadmin true role//
                checkAuthkeyExpiry = false;
            }
            let authKeyModifiedDate = moment(userlogininfo.datemodified).format("YYYY-MM-DD HH:mm:ss");
            if (checkAuthkeyExpiry == false) {
                return [userlogininfo];
            }
            if (authKeyModifiedDate > dateTimeNow) {
                return [userlogininfo];
            }

            userlogininfo.error = "session-timeout";

            return [userlogininfo];
        }, repoFunction



    }
}