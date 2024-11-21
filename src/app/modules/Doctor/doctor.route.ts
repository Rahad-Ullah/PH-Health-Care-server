import express from "express";
import { doctorControllers } from "./doctor.controllet";

const router = express.Router();

router.get("/", doctorControllers.getAllDoctors);

router.get("/:id", doctorControllers.getDoctorById);

router.patch("/:id", doctorControllers.updateDoctor);

router.delete("/soft/:id", doctorControllers.softDeleteDoctor);

router.delete("/:id", doctorControllers.deleteDoctor);

export const DoctorRoutes = router;
