import { Op, Sequelize } from "sequelize";
import { APIError } from "../app";

import { bookingSchemaValidation } from "./validation";
import { Berth } from "../models/birth";
import { RAC } from "../models/rac";
import { WaitingList } from "../models/waitin_list";
import { BERTH_TYPE, GENDER, TICKET_STATUS } from "../constants";
import { Passenger } from "../models/passenger";
import { Ticket } from "../models/ticket";
import { removeTicks } from "sequelize/types/utils";

export async function bookTicket(data) {
  try {
    const validatedData = await bookingSchemaValidation.validateAsync(data);

    const berthCounts: any = await Berth.findAll({
      attributes: [
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(
              `CASE WHEN berth_type = '${BERTH_TYPE.LOWER}' THEN 1 END`
            )
          ),
          "lower",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(
              `CASE WHEN berth_type = '${BERTH_TYPE.MIDDLE}' THEN 1 END`
            )
          ),
          "middle",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(
              `CASE WHEN berth_type = '${BERTH_TYPE.UPPER}' THEN 1 END`
            )
          ),
          "upper",
        ],
      ],
      where: { active: true },
      raw: true,
    });

    const racCount = await RAC.count({ where: { active: true } });
    const waitingListCount = await WaitingList.count({
      where: { active: true },
    });

    const berthCount = {
      lower: berthCounts[0].lower,
      middle: berthCounts[0].middle,
      upper: berthCounts[0].upper,
      side_lower: berthCounts[0].side_lower,
      side_upper: berthCounts[0].side_upper,
      rac: racCount,
      waiting_list: waitingListCount,
    };
    if (waitingListCount + data.length >= 10) {
      return { status: "failed", data: "No Tickets Available" };
    }
    const bookedTickets: {
      ticketId: string;
      name: string;
      age: number;
      status: string;
      berthType: string | null;
    }[] = [];
    const childPassengers: {
      passengerId: string;
      name: string;
      age: number;
    }[] = [];
    for (const passenger of data) {
      const { name, age, gender } = passenger;

      const passengerInsert = await Passenger.create({
        name,
        age,
        gender,
        is_child: age < 5,
      });

      if (age < 5) {
        childPassengers.push({
          passengerId: passengerInsert.id,
          name,
          age,
        });
        continue; // Skip ticket assignment for children under 5
      }

      let status = TICKET_STATUS.WAITING_LIST;
      let berthType: string | null = null;
      let berth_number = 0;

      if (
        berthCount.lower < 21 &&
        (age >= 60 ||
          (gender === `${GENDER.FEMALE}` && data.some((p) => p.age < 5)))
      ) {
        status = TICKET_STATUS.CONFIRMED;
        berthType = BERTH_TYPE.LOWER;
        berthCount.lower++;
        berth_number =
          parseInt(berthCount.lower) +
          parseInt(berthCount.upper) +
          parseInt(berthCount.middle);
      } else if (berthCount.middle < 21) {
        status = TICKET_STATUS.CONFIRMED;
        berthType = BERTH_TYPE.MIDDLE;
        berthCount.middle++;
        berth_number =
          parseInt(berthCount.lower) +
          parseInt(berthCount.upper) +
          parseInt(berthCount.middle);
      } else if (berthCount.upper < 21) {
        status = TICKET_STATUS.CONFIRMED;
        berthType = BERTH_TYPE.UPPER;
        berthCount.upper++;
        berth_number =
          parseInt(berthCount.lower) +
          parseInt(berthCount.upper) +
          parseInt(berthCount.middle);
      } else if (berthCount.rac < 9) {
        status = TICKET_STATUS.RAC;
        berthType = BERTH_TYPE.RAC;
        berthCount.rac++;
        berth_number = berthCount.rac;
      } else {
        berthCount.waiting_list++;

        berth_number = berthCount.waiting_list;
      }
      const ticketInsert = await Ticket.create({
        passenger_id: passengerInsert.id,
        status,
        berth_type: berthType,
      });

      switch (status) {
        case TICKET_STATUS.CONFIRMED:
          await insertDataOnConfirmation(
            ticketInsert.id,
            berth_number,
            berthType as string
          );
          break;
        case TICKET_STATUS.RAC:
          await RAC.create({ ticket_id: ticketInsert.id, berth_number });
          break;
        case TICKET_STATUS.WAITING_LIST:
          await WaitingList.create({
            ticket_id: ticketInsert.id,
            queue_position: berth_number,
          });
          break;
      }

      bookedTickets.push({
        ticketId: ticketInsert.id,
        name,
        age,
        status,
        berthType,
      });
    }
    return { status: "Tickets booked", bookedTickets, childPassengers };
  } catch (e) {
    throw new APIError((e as APIError).message, (e as APIError).code);
  }
}

export async function insertDataOnConfirmation(
  ticketId: string,
  berth_number: number,
  berth_type: string
) {
  try {
    const insertData = await Berth.create({
      ticket_id: ticketId,
      berth_number,
      berth_type,
    });
    return insertData;
  } catch (e) {
    throw new APIError("Unable to update the daa");
  }
}

export async function cancelTicket(ticketId: string) {
  try {
    // Step 1: Find the ticket and berth info
    const ticket = await Ticket.findOne({ where: { id: ticketId } });

    if (!ticket) {
      return { status: "failed", message: "Ticket not found" };
    }

    if (ticket.status !== TICKET_STATUS.CONFIRMED) {
      return {
        status: "failed",
        message: "Only confirmed tickets can be canceled",
      };
    }

    // Retrieve berth details before deleting
    const berthPassenger = await Berth.findOne({
      where: { ticket_id: ticketId },
      raw: true,
    });

    if (!berthPassenger) {
      return { status: "failed", message: "Berth info not found" };
    }

    console.log("Canceled Berth Info:", berthPassenger);

    // Step 2: Remove the berth allocation
    await Berth.destroy({ where: { ticket_id: ticketId } });

    // Step 3: Find an RAC passenger to promote to CONFIRMED
    const racPassenger = await RAC.findOne({
      order: [["berth_number", "ASC"]],
      raw: true,
    });

    if (racPassenger) {
      console.log("Moving RAC Passenger:", racPassenger);

      // Promote RAC passenger to confirmed status
      await Ticket.update(
        {
          status: TICKET_STATUS.CONFIRMED,
          berth_type: berthPassenger.berth_type,
        },
        { where: { id: racPassenger.ticket_id } }
      );

      // Assign them the canceled berth
      await Berth.create({
        ticket_id: racPassenger.ticket_id,
        berth_number: berthPassenger.berth_number, // Assigning old berth
        berth_type: berthPassenger.berth_type,
      });

      // Remove them from RAC
      await RAC.destroy({ where: { ticket_id: racPassenger.ticket_id } });

      // Step 4: Check if a waiting-list passenger exists
      const waitingListPassenger = await WaitingList.findOne({
        order: [["queue_position", "ASC"]],
        raw: true,
      });

      if (waitingListPassenger) {
        console.log("Moving Waiting List Passenger:", waitingListPassenger);

        // Move them to RAC
        await Ticket.update(
          { status: TICKET_STATUS.RAC, berth_type: BERTH_TYPE.RAC },
          { where: { id: waitingListPassenger.ticket_id } }
        );

        // Assign a new RAC berth number (reusing freed berth)
        await RAC.create({
          ticket_id: waitingListPassenger.ticket_id,
          berth_number: racPassenger.berth_number, // Assign previous RAC seat
        });

        // Remove from waiting list
        await WaitingList.destroy({
          where: { ticket_id: waitingListPassenger.ticket_id },
        });

        // 🔄 **Shift down all remaining waiting list passengers**
        await WaitingList.update(
          { queue_position: Sequelize.literal("queue_position - 1") },
          {
            where: {
              queue_position: { [Op.gt]: waitingListPassenger.queue_position },
            },
          }
        );
      } else {
        // 🔄 **If no waiting list passenger, shift down all remaining RAC berth numbers**
        await RAC.update(
          { berth_number: Sequelize.literal("berth_number - 1") },
          { where: { berth_number: { [Op.gt]: racPassenger.berth_number } } }
        );
      }
    } else {
      // 🔄 **No RAC passenger, shift down waiting list numbers**
      await WaitingList.update(
        { queue_position: Sequelize.literal("queue_position - 1") },
        { where: { queue_position: { [Op.gt]: 1 } } }
      );
    }

    // Step 5: Delete the canceled ticket
    await Ticket.destroy({ where: { id: ticketId } });

    return { status: "success", message: "Ticket canceled successfully" };
  } catch (error) {
    console.error(error);
    throw new APIError("Error canceling ticket");
  }
}

export async function getBookedTickets() {
  try {
    const bookedTickets = await Ticket.findAll({
      include: [
        {
          model: Passenger,
          as: "passenger",
          attributes: ["id", "name", "age", "gender", "is_child"],
        },
      ],
      order: [["id", "ASC"]],
      raw: true,
    });

    return { status: "success", bookedTickets };
  } catch (e) {
    console.error(e);
    throw new APIError((e as APIError).message, (e as APIError).code);
  }
}

export async function getAvailableTicketsTickets() {
  try {
    const berthTickets = await Berth.count();
    const availableTickets = 63 - berthTickets;
    const rac = await RAC.count();
    const availableRAC = 18 - rac;
    const waitingList = await WaitingList.count();
    const availableWaitingList = 10 - waitingList;

    return {
      status: "Success",
      totalTicketsAvailable:
        availableTickets + availableRAC + availableWaitingList,
      availableTickets,
      availableRAC,
      availableWaitingList,
    };
  } catch (e) {
    console.error(e);
    throw new APIError((e as APIError).message, (e as APIError).code);
  }
}
