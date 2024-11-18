import express from "express";
import { authControllers } from "./auth.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/login", authControllers.loginUser);
router.post("/refresh-token", authControllers.refreshToken);
router.post("/change-password", auth(), authControllers.changePassword);
router.post("/forgot-password", authControllers.forgotPassword);
router.post("/reset-password", authControllers.resetPassword);

export const authRoutes = router;
