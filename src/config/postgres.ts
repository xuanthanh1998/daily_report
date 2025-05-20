import { Sequelize } from 'sequelize';

export const pgSequelize = new Sequelize(
    process.env.PG_DATABASE || 'db_test',
    process.env.PG_USER || 'postgres',
    process.env.PG_PASSWORD ?? '',
    {
        host: process.env.PG_HOST || 'localhost',
        port: parseInt(process.env.PG_PORT || '5432', 10),
        dialect: 'postgres',
        logging: false,
    }
);
console.log('PG_PASSWORD:', typeof process.env.PG_PASSWORD, process.env.PG_PASSWORD);
