const express = require("express");
const app = express();
const webhookRoutes = require("./routes/webhook");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/", webhookRoutes);

app.listen(port, () => {
  console.log(`Webhook listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.status(200).send("Webhook listening");
});
