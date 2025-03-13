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
  NOW,
} from "sequelize";
import { sequelize } from "../database";
import { Passenger } from "./passenger";
import { Berth } from "./birth";
import { RAC } from "./rac";
import { WaitingList } from "./waitin_list";

const ticketSchema = {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  passenger_id: {
    type: UUID,
    refereces: {
      model: Passenger,
      key: "id",
    },
  },
  status: {
    type: STRING,
  },
  berth_type: {
    type: STRING,
  },
  booking_time: {
    type: DATE,
    defaultValue: NOW,
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

export class Ticket extends Model<
  InferAttributes<Ticket>,
  InferCreationAttributes<Ticket>
> {
  declare id: CreationOptional<string>;
  declare passenger_id: ForeignKey<Passenger["id"]>;
  declare status: string;
  declare berth_type: string | null;
  declare booking_time: CreationOptional<Date>;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Ticket.init(ticketSchema, {
  sequelize,
  modelName: "tickets",
  tableName: "tickets",
  timestamps: true,
});

// Ticket belongs to Passenger
Ticket.belongsTo(Passenger, { foreignKey: "passenger_id", as: "passenger" });
