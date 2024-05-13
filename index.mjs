import express, { json } from "express";
import session from "express-session";
import cors from "cors";

import { Redis } from "ioredis";
import RedisStore from "connect-redis";

import webhookRoutes from "./app/routes/webhook.mjs";
import otpRoutes from "./app/routes/otpRoutes.mjs";
import googleAuthRoutes from "./app/routes/googleAuthRoutes.mjs";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 8000;
const app = express();

const client = new Redis(process.env.UPSTASH_REDIS_URL);

client.on("connect", function () {
  console.log("Redis client connected!");
});

client.on("error", function (error) {
  console.error("Error connecting to redis client:", error);
});

app.use(
  session({
    store: new RedisStore({ client: client }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN.split(","),
    credentials: true,
  })
);

app.use("/", webhookRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/auth/google", googleAuthRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.status(200).send("Webhook listening");
});
