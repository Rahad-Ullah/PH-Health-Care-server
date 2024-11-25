import express from "express";
import { DoctorScheduleControllers } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.DOCTOR),
  DoctorScheduleControllers.createDoctorSchedule
);

router.get(
  "/my-schedule",
  auth(UserRole.DOCTOR),
  DoctorScheduleControllers.getMySchedules
);

export const DoctorScheduleRoutes = router;
