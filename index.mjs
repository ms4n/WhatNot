import express, { json } from "express";
import session from "express-session";
import cors from "cors";

import redis from "redis";
import RedisStore from "connect-redis";

import webhookRoutes from "./routes/webhook.mjs";
import otpRoutes from "./routes/otpRoutes.mjs";
import googleAuthRoutes from "./routes/googleAuthRoutes.mjs";

import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

const client = redis.createClient({
  url: process.env.UPSTASH_REDIS_URL,
});
client.connect().catch(console.error);

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
    origin: ["http://localhost:3000", "https://whatnotapp.vercel.app"],
    credentials: true,
  })
);

app.use("/", webhookRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/auth/google", googleAuthRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  res.status(200).send("Webhook listening");
});
