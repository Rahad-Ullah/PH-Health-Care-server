import express from "express";
import { patientControllers } from "./patient.controller";

const router = express.Router();

router.get("/", patientControllers.getAllPatients);

export const PatientRoutes = router;
