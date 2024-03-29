import { Sequelize } from "sequelize";
let sequelize: any;
export const sequelizeConnect = (dbName: string) => {
    sequelize = new Sequelize(dbName, 'postgres', '1234', {
        dialect: "postgres",
        host: "localhost",
        timezone: "Asia/Kathmandu",
        pool: {
            max: 5, // for one sequelize instance has 5 max pool connection size
            min: 0,
            idle: 3000,
            acquire: 100000, // how much request holds resource
        },
        logging: true,
    });
};

export const ConnectToPostgres = () => {
    return sequelize;
};