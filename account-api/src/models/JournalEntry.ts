import { DataTypes } from "sequelize";
export default function (sequelize) {
    return sequelize.define('JournalEntry', {
        journalentryid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        guid: {
            type: DataTypes.UUID
        },
        ledgerheadid: {
            type: DataTypes.INTEGER
        },
        isdebit: {
            type: DataTypes.BOOLEAN
        },
        iscredit: {
            type: DataTypes.BOOLEAN
        },
        moneytransaction: {
            type: DataTypes.FLOAT
        },
        description:{
            type:DataTypes.TEXT
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
        tableName: 'journalentries',
        timestamps: false
    });
}