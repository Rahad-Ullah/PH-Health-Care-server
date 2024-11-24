import express from "express";
import { scheduleControllers } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/", auth(UserRole.DOCTOR), scheduleControllers.getAllSchedules);

router.post("/", scheduleControllers.createSchedule);

export const ScheduleRoutes = router;
