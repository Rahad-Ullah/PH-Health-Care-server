import { z } from "zod";

const createSpeciality = z.object({
  title: z.string({ required_error: "Title is required" }),
});

export const SpecialitiesValidations = {
  createSpeciality,
};
