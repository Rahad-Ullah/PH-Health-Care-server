import express from "express";
import { scheduleControllers } from "./schedule.controller";

const router = express.Router();

router.get("/", scheduleControllers.getAllSchedules);

router.post("/", scheduleControllers.createSchedule);

export const ScheduleRoutes = router;
