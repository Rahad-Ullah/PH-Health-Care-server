import express from "express";
import { userRoutes } from "../modules/User/user.route";
import { adminRoutes } from "../modules/Admin/admin.route";
import { authRoutes } from "../modules/Auth/auth.route";
import { SpecialitiesRoutes } from "../modules/Specialities/specialities.route";
import { DoctorRoutes } from "../modules/Doctor/doctor.route";
import { PatientRoutes } from "../modules/Patient/patient.route";
import { ScheduleRoutes } from "../modules/Schedule/schedule.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/admin",
    route: adminRoutes,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/specialities",
    route: SpecialitiesRoutes,
  },
  {
    path: "/doctor",
    route: DoctorRoutes,
  },
  {
    path: "/patient",
    route: PatientRoutes,
  },
  {
    path: "/schedule",
    route: ScheduleRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
