import express from "express";
import { scheduleControllers } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/", auth(UserRole.DOCTOR), scheduleControllers.getAllSchedules);

router.post("/", scheduleControllers.createSchedule);

router.delete(
  "/:id",
  auth(UserRole.DOCTOR),
  scheduleControllers.deleteSchedule
);

export const ScheduleRoutes = router;
