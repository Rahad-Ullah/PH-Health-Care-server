import express from "express";
import { adminControllers } from "./admin.controller";

const router = express.Router();

router.get("/", adminControllers.getAllAdmins);
router.get("/:id", adminControllers.getAdminById);
router.patch("/:id", adminControllers.updateAdmin);
router.delete("/:id", adminControllers.deleteAdmin);
router.delete("/soft/:id", adminControllers.softDeleteAdmin);

export const adminRoutes = router;
