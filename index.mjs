import express, { json } from "express";
const app = express();
import webhookRoutes from "./routes/webhook.mjs";
import otpRoutes from "./routes/otpRoutes.mjs";
const port = process.env.PORT || 3000;

app.use(json());

app.use("/", webhookRoutes);
app.use("/api", otpRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  res.status(200).send("Webhook listening");
});
