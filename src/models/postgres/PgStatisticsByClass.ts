import { DataTypes } from 'sequelize';
import { pgSequelize } from '../../config/postgres';

export const PgStatisticsByClass = pgSequelize.define('PgStatisticsByClass', {
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    date_report: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        primaryKey: true,
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    create_datetime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    update_datetime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'statistics_daily_report',
    schema: 'public',
    timestamps: false,
});
