import { Sequelize } from 'sequelize';

export const pgSequelize = new Sequelize(
    process.env.PG_DATABASE || 'your_db',
    process.env.PG_USER || 'your_user',
    process.env.PG_PASSWORD || 'your_password',
    {
        host: process.env.PG_HOST || 'localhost',
        port: parseInt(process.env.PG_PORT || '5432', 10),
        dialect: 'postgres',
        logging: false,
    }
);
