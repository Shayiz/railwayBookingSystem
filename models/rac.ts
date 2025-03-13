import {
  BOOLEAN,
  CreationOptional,
  DATE,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  UUID,
  UUIDV4,
  INTEGER,
  NOW,
} from "sequelize";
import { sequelize } from "../database";
import { Ticket } from "./ticket";
const racSchema = {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  ticket_id: {
    type: UUID,
    refereces: {
      model: Ticket,
      key: "id",
    },
  },
  berth_number: {
    type: INTEGER,
  },
  active: {
    type: BOOLEAN,
    defaultValue: true,
  },
  createdAt: {
    type: DATE,
  },
  updatedAt: {
    type: DATE,
  },
};

export class RAC extends Model<
  InferAttributes<RAC>,
  InferCreationAttributes<RAC>
> {
  declare id: CreationOptional<string>;
  declare ticket_id: ForeignKey<Ticket["id"]>;
  declare berth_number: number;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

RAC.init(racSchema, {
  sequelize,
  modelName: "rac",
  tableName: "rac",
  timestamps: true,
});
