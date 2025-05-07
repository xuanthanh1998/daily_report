import {Sequelize, DataTypes, Optional} from 'sequelize';
import dotenv from 'dotenv';
import {sequelize} from "../config/mysql";

dotenv.config();

export interface usersAttributes {
    id: number;
    name?: string;
    gender?: number;
    phone?: string;
    country?: string;
    city?: string;
    address?: string;
    password?: string;
    type?: number;
    create_datetime?: Date;
    update_datetime?: Date;
}

//
// export type usersPk = "id";
// export type usersId = typeof User;
export type usersOptionalAttributes =
    "id"
    | "name"
    | "gender"
    | "phone"
    | "country"
    | "city"
    | "address"
    | "password"
    | "type"
    | "create_datetime"
    | "update_datetime";
export type usersCreationAttributes = Optional<usersAttributes, usersOptionalAttributes>;

export const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    gender: {
        type: DataTypes.TINYINT,
        allowNull: true,
        comment: "Giới tính 0: nam, 1: nữ",
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    country: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING(200),
        allowNull: true,
    },
    type: {
        type: DataTypes.TINYINT,
        allowNull: true,
        comment: "Loại tài khoản 0: phụ huynh, 1: giáo viên, 2: lãnh đạo",
    },
    create_datetime: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    update_datetime: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    }
}, {
    tableName: 'users',
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

