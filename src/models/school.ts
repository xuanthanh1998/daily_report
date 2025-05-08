import * as Sequelize from 'sequelize';
import {DataTypes, Model, Optional} from 'sequelize';
import {sequelize} from "../config/mysql";

export interface schoolAttributes {
    id: number;
    name?: string;
    country?: string;
    city?: string;
    address?: string;
    create_datetime?: Date;
    update_datetime?: Date;
}

export type schoolOptionalAttributes =
    "id"
    | "name"
    | "country"
    | "city"
    | "address"
    | "create_datetime"
    | "update_datetime";
export type schoolCreationAttributes = Optional<schoolAttributes, schoolOptionalAttributes>;

export const School = sequelize.define('School', {
    id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    country: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    create_datetime: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    update_datetime: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
}, {
    tableName: 'school',
    timestamps: false,
    indexes: [
        {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [
                {name: "id"},
            ]
        },
    ]
});
