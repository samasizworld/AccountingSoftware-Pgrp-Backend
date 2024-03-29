import { DataTypes } from "sequelize";
import { UserRoleModel } from "./UserRole";
const moment = require("moment");

export const UserModel = {
    User: function (context: any) {
        var user = this.ModelUser(context).schema("user");
        user.hasMany(UserRoleModel.UserRole(context), {
            as: "userroles",
            foreignKey: "userid",
        });
        return user;
    },
    ModelUser: function (context: any) {
        return context.define(
            "user",
            {
                userid: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                guid: { type: DataTypes.UUID },
                firstname: { type: DataTypes.STRING },
                lastname: { type: DataTypes.STRING },
                displayname: { type: DataTypes.STRING },
                emailaddress: { type: DataTypes.STRING },
                address: { type: DataTypes.STRING },
                phonenumber: { type: DataTypes.STRING },
                salt: { type: DataTypes.STRING },
                password: { type: DataTypes.STRING },
                datecreated: { type: "TIMESTAMP", defaultValue: moment().format('YYYY-MM-DD HH:mm:ss') },
                datemodified: { type: "TIMESTAMP", defaultValue: moment().format('YYYY-MM-DD HH:mm:ss') },
                datedeleted: { type: "TIMESTAMP" },
            },
            { timestamps: false, tableName: "users" }
        );
    },
};
