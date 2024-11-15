import express from "express";
import { authControllers } from "./auth.controller";

const router = express.Router();

router.post("/login", authControllers.loginUser);
router.post("/refresh-token", authControllers.refreshToken);

export const authRoutes = router;
