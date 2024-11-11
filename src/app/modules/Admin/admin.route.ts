import express from "express";
import { adminControllers } from "./admin.controller";

const router = express.Router();

router.get("/", adminControllers.getAllAdmins);
router.get("/:id", adminControllers.getAdminById);

export const adminRoutes = router;
