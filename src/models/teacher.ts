import * as Sequelize from 'sequelize';
import {DataTypes, Model, Optional} from 'sequelize';
import {sequelize} from "../config/mysql";
import {usersAttributes} from "./users";

export interface teacherAttributes {
    id: number;
    user_id: number;
    teacher_code?: number;
    school_id?: number;
    create_datetime?: Date;
    update_datetime?: Date;
    teachers?: usersAttributes;
}

export type teacherOptionalAttributes =
    "id"
    | "user_id"
    | "teacher_code"
    | "school_id"
    | "create_datetime"
    | "update_datetime";
export type teacherCreationAttributes = Optional<teacherAttributes, teacherOptionalAttributes>;

export const Teacher = sequelize.define('Teacher', {
    id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    teacher_code: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    school_id: {
        type: DataTypes.INTEGER,
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
    tableName: 'teacher',
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

