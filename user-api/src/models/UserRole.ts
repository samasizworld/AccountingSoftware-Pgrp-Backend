import moment from "moment";
import { DataTypes } from "sequelize";
export const UserRoleM = {
  UserRole: function (context: any) {
    return this.UserRoleModel(context).schema("user");
  },
  UserRoleModel: function (context: any) {
    return context.define(
      "userrole",
      {
        userroleid: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        guid: { type: DataTypes.UUID },
        name: { type: DataTypes.STRING },
        datecreated: { type: "TIMESTAMP", default: moment().format('YYYY-MM-DD HH:mm:ss') },
        datemodified: { type: "TIMESTAMP", default: moment().format('YYYY-MM-DD HH:mm:ss') },
        datedeleted: { type: "TIMESTAMP" },
        userid: { type: DataTypes.INTEGER },
        issystemadmin: { type: DataTypes.BOOLEAN }
      },
      { timestamps: false, tableName: "userroles" }
    );
  },
};
