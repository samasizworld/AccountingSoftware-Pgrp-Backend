import moment from "moment";
import { AccessLabelService } from "../modelservices/AccessLabelService";
import { UserLoginInfoService } from "../modelservices/UserLoginInfoService";
import { UserService } from "../modelservices/UserService";
import { ConnectToPostgres } from "../sequelize/sequelize";

export const CredentialController = {
    async Login(req, res) {
        let sequelize: any = ConnectToPostgres();
        let { Username, Password } = req.body;
        try {
            let [userInfo]: any = await UserService(sequelize).repoFunction.loadAllWithAttribute(['guid', 'emailaddress', 'displayname', 'salt', 'password'], {
                datedeleted: null,
                emailaddress: sequelize.where(sequelize.fn("lower", sequelize.col('emailaddress')), '=', Username.toLowerCase())
            });
            if (!userInfo) {
                throw 'No User Found'
            }
            let validateUser = await UserLoginInfoService(sequelize).Validate(Password, userInfo.password, userInfo.salt);
            if (!validateUser) {
                throw 'Invalid Credentials';
            }
            let { authKey } = await UserLoginInfoService(sequelize).GenerateAuthKey(userInfo.guid, 3600, userInfo.displayname);
            return res.status(200).send({ AuthenticationKey: authKey, Username: userInfo.displayname, UserReference: userInfo.guid });
        } catch (error) {
            throw error;
        }
    },
    async Authenticate(req, res) { // just verify token
        const sequelize = ConnectToPostgres();
        let { Token } = req.body;
        let IsSystemAdmin = false;
        try {
            let userLoginInfoService = UserLoginInfoService(sequelize);
            let userService = UserService(sequelize);
            let parsedUserLoginInfoData = JSON.parse(Buffer.from(Token, 'base64').toString('ascii'));
            let username = parsedUserLoginInfoData.Username ? parsedUserLoginInfoData.username : "";
            let userlogininfoid: string = parsedUserLoginInfoData.UserLoginInfoId;
            let userreference = parsedUserLoginInfoData.UserReference;
            let authKeyExpiryInSeconds = parsedUserLoginInfoData.TokenExpiresIn;

            let [userlogininfo]: any = await userLoginInfoService.checkAuthKeyValidity(userlogininfoid, authKeyExpiryInSeconds);
            if (!userlogininfo) { throw 'Token not found' }
            if (userlogininfo.error) { throw 'Session Expired' }
            let roles: any = await userService.LoadUserWithRole(userreference);
            if (roles && roles[0].userroles.length > 0 && roles[0].userroles.find(ur => ur.issystemadmin == true)) {
                IsSystemAdmin = true;
            }

            return res.status(200).send({ UserReference: userreference, IsSystemAdmin: IsSystemAdmin, Username: username })


        } catch (error) {
            throw error;
        }
    },

    async Authorize(req, res) { // verify permission
        let sequelize: any = ConnectToPostgres();
        let { Token, Path, Method } = req.body;
        try {
            let repoFunction = UserLoginInfoService(sequelize);
            let accesslabelService: any = new AccessLabelService(sequelize);
            let parsedUserLoginInfoData = JSON.parse(Buffer.from(Token, 'base64').toString('ascii'))
            let userlogininfoid: string = parsedUserLoginInfoData.UserLoginInfoId;
            let IsSystemAdmin = false;
            let IsAuthorized = false;
            let [userlogininfo]: any = await repoFunction.repoFunction.loadAllWithAttribute(['userreference'], { datedeleted: null, guid: userlogininfoid });
            if (!userlogininfo) {
                throw Error('No Token id');
            }
            // main logic here for permission
            let [accesslabel]: any = await accesslabelService.dbSequelize.loadAllOffset(0, 0, 'accesslabelid', 'asc',
                {
                    datedeleted: null,
                    uri: sequelize.literal(`lower("accesslabel"."uri")='${Path.toLowerCase()}'`)
                }, null);

            if (!accesslabel) { throw Error('No Permission Set') }


            let roles: any = await UserService(sequelize).LoadUserWithRole(userlogininfo.userreference);
            let assignedroles = roles[0].userroles;
            assignedroles.forEach(async (r: any) => {
                IsAuthorized = await accesslabelService.checkAccessLabelPermissionPerRole(r.guid, accesslabel.accesslabelid, Method);
            })
            if (assignedroles && assignedroles.length > 0 && assignedroles.find(ar => ar.issystemadmin == true)) {
                IsSystemAdmin = true
            }
            return res.status(200).send({ IsSystemAdmin, IsAuthorized })

        } catch (error) {
            return res.status(500).send({ errorMessage: error.message, errorStack: error.stack });
        }
    }, async Logout(req, res) {
        let sequelize: any = ConnectToPostgres();
        let { Token } = req.body;
        try {
            let parsedToken = JSON.parse(Buffer.from(Token).toString('ascii'));
            let userlogininfoid = parsedToken.UserLoginInfoId;
            let [userlogininfo]: any = await UserLoginInfoService(sequelize).repoFunction.loadAllWithAttribute(['userreference'], { datedeleted: null, guid: userlogininfoid });
            if (!userlogininfo) {
                throw 'No User Session Found';
            }
            await UserLoginInfoService(sequelize).repoFunction.update({ datedeleted: moment().format() }, { datedeleted: null, guid: userlogininfoid });
            return res.status(204).send()
        } catch (error) {
            throw error;
        }
    }
}