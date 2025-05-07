import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface teacherAttributes {
  id: number;
  user_id?: number;
  teacher_code?: number;
  school_id?: number;
  create_datetime?: Date;
  update_datetime?: Date;
}

export type teacherPk = "id";
export type teacherId = teacher[teacherPk];
export type teacherOptionalAttributes = "id" | "user_id" | "teacher_code" | "school_id" | "create_datetime" | "update_datetime";
export type teacherCreationAttributes = Optional<teacherAttributes, teacherOptionalAttributes>;

export class teacher extends Model<teacherAttributes, teacherCreationAttributes> implements teacherAttributes {
  id!: number;
  user_id?: number;
  teacher_code?: number;
  school_id?: number;
  create_datetime?: Date;
  update_datetime?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof teacher {
    return teacher.init({
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
    sequelize,
    tableName: 'teacher',
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
