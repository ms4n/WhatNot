import express, { json } from "express";
import cors from "cors";

import webhookRoutes from "./routes/webhook.mjs";
import otpRoutes from "./routes/otpRoutes.mjs";

const app = express();
const port = process.env.PORT || 8000;

app.use(json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://whatnotapp.vercel.app"],
  })
);

app.use("/", webhookRoutes);
app.use("/api", otpRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  res.status(200).send("Webhook listening");
});
