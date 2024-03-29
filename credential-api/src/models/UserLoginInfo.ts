import { DataTypes } from "sequelize";
const moment = require("moment");

export const UserLoginInfoModel = {
    UserLoginInfo: function (context: any) {
        let userlogininfo = this.ModelUserLoginInfo(context).schema("usertoken");

        return userlogininfo;
    },
    ModelUserLoginInfo: function (context: any) {
        return context.define(
            "userlogininfo",
            {
                userlogininfoid: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                guid: { type: DataTypes.UUID },
                usertoken: { type: DataTypes.TEXT },
                userreference: { type: DataTypes.UUID },
                tokenexpiresin: { type: DataTypes.BIGINT },
                datecreated: { type: "TIMESTAMP", defaultValue: moment().format('YYYY-MM-DD HH:mm:ss') },
                datemodified: { type: "TIMESTAMP", defaultValue: moment().format('YYYY-MM-DD HH:mm:ss') },
                datedeleted: { type: "TIMESTAMP" },
            },
            { timestamps: false, tableName: "userlogininfos" }
        );
    },
};
