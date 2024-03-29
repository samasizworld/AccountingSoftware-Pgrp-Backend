import { Repository } from "../db/dbFunction";
import { UserModel } from "../models/User"

export const UserService = (context) => {
    let user = UserModel.User(context);
    let repoFunction = Repository(user);
    return {
        repoFunction, LoadUserWithRole: async function (userId: string) {
            let include = [
                {
                    association: 'userroles',
                    required: true,
                    where:
                        { datedeleted: null }
                }];
            let result: any = await repoFunction.loadAllOffset(0, 0, 'firstname', 'asc', { datedeleted: null, guid: userId }, include);
            return result;
        }
    }


}