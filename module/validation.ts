import * as Joi from "joi";
import { GENDER } from "../constants";

const GenderValuesEnum = Object.values(GENDER);

const passengerSchemaTicketBookValidation = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  age: Joi.number().integer().min(0).max(120).required(),
  gender: Joi.string()
    .valid(...GenderValuesEnum)
    .required(),
});

const bookingSchemaValidation = Joi.array()
  .items(passengerSchemaTicketBookValidation)
  .min(1)
  .max(5)
  .required();
export { bookingSchemaValidation };
