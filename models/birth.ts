import {
  BOOLEAN,
  CreationOptional,
  DATE,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  STRING,
  UUID,
  UUIDV4,
  INTEGER,
  NOW,
} from "sequelize";
import { sequelize } from "../database";
import { Ticket } from "./ticket";

const berthSchema = {
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
  berth_type: {
    type: STRING,
    allowNull: false,
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

export class Berth extends Model<
  InferAttributes<Berth>,
  InferCreationAttributes<Berth>
> {
  declare id: CreationOptional<string>;
  declare ticket_id: ForeignKey<Ticket["id"]>;
  declare berth_number: number;
  declare berth_type: string;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Berth.init(berthSchema, {
  sequelize,
  modelName: "berths",
  tableName: "berths",
  timestamps: true,
});

Berth.belongsTo(Ticket, {
  as: "ticket",
  foreignKey: "ticket_id",
});
