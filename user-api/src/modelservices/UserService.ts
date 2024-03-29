import { GeneralService } from "./general/GeneralService";
import { UserModel } from "../models/User";
import { dbFunctions } from "../db/dbFunction";
import { Op } from "sequelize";
export class UserService<T> extends GeneralService<T> {
  protected sequelize: any;
  constructor(context: any) {
    const User = UserModel.User(context);
    super(new dbFunctions(User));
    this.sequelize = context;
  }
  async getUserByEmailId(email: string) {
    let results = await this.LoadAllWithAttribute(["guid", "emailaddress"], {
      datedeleted: null,
      emailaddress: email,
    });
    return results;
  }
  async LoadUserList(search: string, pagesize, offset, orderdir, orderby) {
    let where: any = {};
    if (search) {
      where = {
        firstname: { [Op.iLike]: '%' + search + '%' }
      }
    }
    where.datedeleted = null;
    let results: any = await this.LoadAllOffset(offset, pagesize, orderby, orderdir, null, where, []);
    let data = await this.Load(null, where);
    results.count = data.length
    return results;
  }
}
