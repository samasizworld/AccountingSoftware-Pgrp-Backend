import { DataTypes } from "sequelize";
const moment = require("moment");

export const UserPermissionModel = {
    UserPermission: function (context: any) {
        let userpermission = this.ModelUserPermission(context).schema("usertoken");

        return userpermission;
    },
    ModelUserPermission: function (context: any) {
        return context.define(
            "userpermission",
            {
                userpermissionid: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                guid: { type: DataTypes.UUID },
                userrolereference: { type: DataTypes.UUID },
                accesslabelid: { type: DataTypes.INTEGER },
                canread: { type: DataTypes.BOOLEAN },
                canwrite: { type: DataTypes.BOOLEAN },
                datecreated: { type: "TIMESTAMP", defaultValue: moment().format('YYYY-MM-DD HH:mm:ss') },
                datemodified: { type: "TIMESTAMP", defaultValue: moment().format('YYYY-MM-DD HH:mm:ss') },
                datedeleted: { type: "TIMESTAMP" },
            },
            { timestamps: false, tableName: "userpermissions" }
        );
    },
};
