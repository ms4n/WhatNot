// otpRoutes.mjs
import express from "express";
import otpController from "../controllers/otpController.mjs";

const router = express.Router();

// Endpoint to generate OTP
router.post("/generate-otp", async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const result = await otpController.handleOTPGeneration(phoneNumber);
    res.json({ data: result });
  } catch (error) {
    console.error("Error generating OTP:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Endpoint to validate OTP
router.post("/validate-otp", async (req, res) => {
  const { phoneNumber, userOTP } = req.body;

  try {
    const result = await otpController.handleOTPValidation(
      phoneNumber,
      userOTP
    );
    res.json({ data: result });
  } catch (error) {
    console.error("Error validating OTP:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
