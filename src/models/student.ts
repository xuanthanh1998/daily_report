import { Sequelize, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/mysql';
import {Class} from "./class";

export interface studentAttributes {
  id: number;
  full_name?: string;
  birthday?: string;
  gender?: number;
  student_code?: number;
  class_id?: number;
  user_id?: number;
  school_id?: number;
  create_datetime?: Date;
  update_datetime?: Date;
}

export type studentOptionalAttributes =
    | 'id'
    | 'full_name'
    | 'birthday'
    | 'gender'
    | 'student_code'
    | 'class_id'
    | 'user_id'
    | 'school_id'
    | 'create_datetime'
    | 'update_datetime';

export type studentCreationAttributes = Optional<studentAttributes, studentOptionalAttributes>;

export const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: DataTypes.TINYINT,
    allowNull: true,
    comment: 'Giới tính 0: nam, 1: nữ',
  },
  student_code: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  school_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
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
  },
}, {
  tableName: 'student',
  timestamps: false,
  indexes: [
    {
      name: 'PRIMARY',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'id' }],
    },
  ],
});