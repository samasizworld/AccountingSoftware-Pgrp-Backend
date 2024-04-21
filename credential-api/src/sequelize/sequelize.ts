import { Sequelize } from "sequelize";
var sequelize: Sequelize;

export const sequelizeConnect = (dbName: string) => {
    sequelize = new Sequelize(dbName, 'postgres', '1234', {
        dialect: "postgres",
        host: "host.docker.internal",
        timezone: "Asia/Kathmandu",
        pool: {
            max: 5,
            min: 0,
            idle: 3000,
            acquire: 100000,
        },
        logging: false,
    });
};

export const ConnectToPostgres = () => {
    return sequelize;
};
