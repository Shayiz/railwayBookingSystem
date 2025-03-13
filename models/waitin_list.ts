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
const waitingListSchema = {
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
  queue_position: {
    type: INTEGER,
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

export class WaitingList extends Model<
  InferAttributes<WaitingList>,
  InferCreationAttributes<WaitingList>
> {
  declare id: CreationOptional<string>;
  declare ticket_id: string;
  declare queue_position: number;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

WaitingList.init(waitingListSchema, {
  sequelize,
  modelName: "waiting_list",
  tableName: "waiting_list",
  timestamps: true,
});
