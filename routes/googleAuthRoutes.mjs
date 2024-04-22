import { Router } from "express";
import authController from "../controllers/auth/authController.mjs";

const router = Router();

router.get("/callback", authController.handleOAuthCallback);
router.get("/auth-url", authController.handleOAuthUrlGeneration);

export default router;
