import express, { json } from "express";
import cors from "cors";

import webhookRoutes from "./app/routes/webhook.mjs";
import otpRoutes from "./app/routes/otpRoutes.mjs";
import googleAuthRoutes from "./app/routes/googleAuthRoutes.mjs";
import { checkRemindersAndSend } from "./app/services/reminderService.mjs";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 8000;
const app = express();

checkRemindersAndSend();

app.use(json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN.split(","),
    credentials: true,
  })
);

//api v1 routes
app.use("/v1", webhookRoutes);
app.use("/v1/otp", otpRoutes);
app.use("/v1/auth/google", googleAuthRoutes);

app.get("/v1/", (req, res) => {
  res.status(200).send("Webhook listening!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
