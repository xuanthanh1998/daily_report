import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql';

export const SchoolPrincipal = sequelize.define('SchoolPrincipal', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'school_principal',
    timestamps: false
});
