import { Router } from "express";
import authController from "../controllers/authController.mjs";

const router = Router();

// router.get("/initiate", handleAuthRedirect);
router.get("/callback", authController.handleOAuthCallback);

router.get("/auth-url", (req, res) => {
  try {
    const phoneNumber = req.headers["phonenumber"];
    req.session.phoneNumber = phoneNumber;

    const authUrl = authController.generateAuthUrl();

    res.json({ authUrl: authUrl });
  } catch (error) {
    console.error("Error generating authentication URL:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
