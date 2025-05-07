import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface itemsAttributes {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type itemsPk = "id";
export type itemsId = items[itemsPk];
export type itemsOptionalAttributes = "id" | "createdAt" | "updatedAt";
export type itemsCreationAttributes = Optional<itemsAttributes, itemsOptionalAttributes>;

export class items extends Model<itemsAttributes, itemsCreationAttributes> implements itemsAttributes {
  id!: number;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof items {
    return items.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'items',
    timestamps: true,
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
