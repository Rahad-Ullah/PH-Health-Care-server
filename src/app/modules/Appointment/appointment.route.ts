import express from "express";
import { AppointmentControllers } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/my-appointment",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  AppointmentControllers.getMyAppointment
);

router.post(
  "/",
  auth(UserRole.PATIENT),
  AppointmentControllers.createAppointment
);


export const AppointmentRoutes = router;
