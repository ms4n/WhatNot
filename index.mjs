import express, { json } from "express";
import cors from "cors";

import webhookRoutes from "./app/routes/webhook.mjs";
import otpRoutes from "./app/routes/otpRoutes.mjs";
import googleAuthRoutes from "./app/routes/googleAuthRoutes.mjs";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 8000;
const app = express();

app.use(json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN.split(","),
    credentials: true,
  })
);

app.use("/api", webhookRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/auth/google", googleAuthRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/api/", (req, res) => {
  res.status(200).send("Webhook listening!");
});
