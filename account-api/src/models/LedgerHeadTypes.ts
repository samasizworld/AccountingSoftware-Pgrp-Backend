import { DataTypes } from "sequelize";
export default function (sequelize) {
    return sequelize.define('LedgerHeadType', {
        ledgerheadtypeid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        guid: {
            type: DataTypes.UUID
        },
        code:{
            type:DataTypes.STRING
        },
        datecreated: {
            type: "TIMESTAMP"
        },
        datemodified: {
            type: "TIMESTAMP"
        },
        datedeleted: {
            type: "TIMESTAMP"
        }
    }, {
        tableName: 'ledgerheadtypes',
        timestamps: false
    });
}