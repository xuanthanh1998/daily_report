import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
    process.env.MYSQL_DB!,
    process.env.MYSQL_USER!,
    process.env.MYSQL_PASS!,
    {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql',
        logging: false,
    }
);
sequelize.authenticate()
    .then(() => {
        console.log('Connection to MySQL has been established successfully.');
    })
    .catch((error) => {
        console.error('Unable to connect to MySQL:', error);
    });