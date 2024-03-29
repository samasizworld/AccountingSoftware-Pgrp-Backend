import { DataTypes } from "sequelize";
export default function (sequelize) {
    return sequelize.define('LedgerHead', {
        ledgerheadid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        guid: {
            type: DataTypes.UUID
        },
        name: {
            type: DataTypes.STRING
        },
        userreference: {
            type: DataTypes.UUID
        },
        ledgerheadtypeid:{
            type:DataTypes.INTEGER
        },
        parentid:{
            type:DataTypes.INTEGER
        },
        amount:{
            type:DataTypes.FLOAT
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
        tableName: 'ledgerheads',
        timestamps: false
    });
}