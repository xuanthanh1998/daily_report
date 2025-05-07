import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface schoolAttributes {
  id: number;
  name?: string;
  country?: string;
  city?: string;
  address?: string;
  create_datetime?: Date;
  update_datetime?: Date;
}

export type schoolPk = "id";
export type schoolId = school[schoolPk];
export type schoolOptionalAttributes = "id" | "name" | "country" | "city" | "address" | "create_datetime" | "update_datetime";
export type schoolCreationAttributes = Optional<schoolAttributes, schoolOptionalAttributes>;

export class school extends Model<schoolAttributes, schoolCreationAttributes> implements schoolAttributes {
  id!: number;
  name?: string;
  country?: string;
  city?: string;
  address?: string;
  create_datetime?: Date;
  update_datetime?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof school {
    return school.init({
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
    sequelize,
    tableName: 'school',
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
