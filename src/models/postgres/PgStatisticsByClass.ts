import { DataTypes } from 'sequelize';
import { pgSequelize } from '../../config/postgres';

export const PgStatisticsByClass = pgSequelize.define('PgStatisticsByClass', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    date_report: {
        type: DataTypes.DATEONLY,
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
    tableName: 'statistics_by_class',
    schema: 'public',
    timestamps: false,
});
