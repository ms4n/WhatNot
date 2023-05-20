const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhookController");
require("dotenv").config();

const webhook_token = process.env.WEBHOOK_TOKEN;

router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];

  if (mode === "subscribe" && token === webhook_token) {
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

router.post("/webhook", async (req, res) => {
  try {
    await webhookController.processMessage(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing message:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
