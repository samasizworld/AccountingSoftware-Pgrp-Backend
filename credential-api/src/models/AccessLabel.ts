import { DataTypes } from "sequelize";
import { UserPermissionModel } from "./UserPermission";
const moment = require("moment");

export const AccessLabelModel = {
    AccessLabel: function (context: any) {
        let accesslabel = this.ModelAccessLabel(context).schema("usertoken");
        let permission = UserPermissionModel.UserPermission(context)
        accesslabel.hasMany(permission, { as: 'permissions', foreignKey: 'accesslabelid' })
        return accesslabel;
    },
    ModelAccessLabel: function (context: any) {
        return context.define(
            "accesslabel",
            {
                accesslabelid: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                guid: { type: DataTypes.UUID },
                name: { type: DataTypes.STRING },
                uri: { type: DataTypes.STRING },
                accesslabeltype: { type: DataTypes.STRING, defaultValue: 'permission' },
                datecreated: { type: "TIMESTAMP", defaultValue: moment().format('YYYY-MM-DD HH:mm:ss') },
                datemodified: { type: "TIMESTAMP", defaultValue: moment().format('YYYY-MM-DD HH:mm:ss') },
                datedeleted: { type: "TIMESTAMP" },
            },
            { timestamps: false, tableName: "accesslabels" }
        );
    },
};
