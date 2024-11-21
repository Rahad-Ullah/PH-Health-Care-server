import express from "express";
import { patientControllers } from "./patient.controller";

const router = express.Router();

router.get("/", patientControllers.getAllPatients);

router.get("/:id", patientControllers.getSinglePatient);

router.patch("/:id", patientControllers.updatePatient);

export const PatientRoutes = router;
