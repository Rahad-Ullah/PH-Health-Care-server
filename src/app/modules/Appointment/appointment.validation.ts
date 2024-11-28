import { z } from "zod";

const create = z.object({
  body: z.object({
    doctorId: z.string({ required_error: "DoctorId is required" }),
    scheduleId: z.string({ required_error: "scheduleId is required" }),
  }),
});

export const AppointmentValidations = {
  create,
};
