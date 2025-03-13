import {
  BOOLEAN,
  CreationOptional,
  DATE,
  INTEGER,
  InferAttributes,
  InferCreationAttributes,
  Model,
  STRING,
  UUID,
  UUIDV4,
} from "sequelize";
import { sequelize } from "../database";

const passengerSchema = {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  name: {
    type: STRING,
    allowNull: false,
  },

  gender: {
    type: STRING,
    allowNull: false,
  },
  is_child: {
    type: BOOLEAN,
    allowNull: false,
  },
  active: {
    type: BOOLEAN,
    allowNull: true,
  },
  age: {
    type: INTEGER,
  },
  createdAt: {
    type: DATE,
  },
  updatedAt: {
    type: DATE,
  },
};

export class Passenger extends Model<
  InferAttributes<Passenger>,
  InferCreationAttributes<Passenger>
> {
  declare id: CreationOptional<string>;

  declare name: string;

  declare gender: string;

  declare is_child: boolean;

  declare age: number;

  declare active: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;
}

Passenger.init(passengerSchema, {
  sequelize,
  modelName: "passengers",
  tableName: "passengers",
  timestamps: true,
});
