"use strict";
const Sequelize = require("sequelize");
module.exports = {
  up: async ({ context: { queryInterface } }) => {
    await queryInterface.createTable("passengers", {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_child: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      active: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    });
    await queryInterface.createTable("tickets", {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      passenger_id: {
        type: Sequelize.UUID,
        references: {
          model: "passengers",
          key: "id",
          deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      status: {
        type: Sequelize.STRING,
      },
      berth_type: {
        type: Sequelize.STRING,
      },
      booking_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      active: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    });
    await queryInterface.createTable("berths", {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      ticket_id: {
        type: Sequelize.UUID,
        references: {
          model: "tickets",
          key: "id",
          onDelete: "SET NULL",
        },
      },
      berth_number: {
        type: Sequelize.INTEGER,
      },
      berth_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      active: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    });
    await queryInterface.createTable("rac", {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      ticket_id: {
        type: Sequelize.UUID,
        references: {
          model: "tickets",
          key: "id",
          deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      berth_number: {
        type: Sequelize.INTEGER,
      },

      active: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    });
    await queryInterface.createTable("waiting_list", {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      ticket_id: {
        type: Sequelize.UUID,
        references: {
          model: "tickets",
          key: "id",
          deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      queue_position: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      active: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    });
  },
  down: async ({ context: { queryInterface } }) => {
    await queryInterface.dropTable("passengers");
    await queryInterface.dropTable("tickets");
    await queryInterface.dropTable("berths");
    await queryInterface.dropTable("waiting_list");
    await queryInterface.dropTable("rac");
  },
};
