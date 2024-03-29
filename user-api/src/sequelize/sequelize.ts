import { Sequelize } from "sequelize";
var sequelize: Sequelize;
let username = "postgres";
let password: "1234";

export const sequelizeConnect = (dbName: string) => {
  sequelize = new Sequelize(dbName, 'postgres', '1234', {
    dialect: "postgres",
    host: "localhost",
    timezone: "Asia/Kathmandu",
    pool: {
      max: 25,
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
