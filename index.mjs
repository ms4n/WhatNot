import express, { json } from "express";
import session from "express-session";
import cors from "cors";

import webhookRoutes from "./routes/webhook.mjs";
import otpRoutes from "./routes/otpRoutes.mjs";
import googleAuthRoutes from "./routes/googleAuthRoutes.mjs";

const app = express();
const port = process.env.PORT || 8000;

app.use(
  session({
    secret: "your-secret-key",
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
