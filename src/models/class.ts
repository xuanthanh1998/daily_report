import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface class_Attributes {
  id: number;
  name?: string;
  school_id?: number;
  teacher_id?: number;
  total_student?: number;
  create_datetime?: Date;
  update_datetime?: Date;
}

export type class_Pk = "id";
export type class_Id = class_[class_Pk];
export type class_OptionalAttributes = "id" | "name" | "school_id" | "teacher_id" | "total_student" | "create_datetime" | "update_datetime";
export type class_CreationAttributes = Optional<class_Attributes, class_OptionalAttributes>;

export class class_ extends Model<class_Attributes, class_CreationAttributes> implements class_Attributes {
  id!: number;
  name?: string;
  school_id?: number;
  teacher_id?: number;
  total_student?: number;
  create_datetime?: Date;
  update_datetime?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof class_ {
    return class_.init({
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
    school_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total_student: {
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
    sequelize,
    tableName: 'class',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
