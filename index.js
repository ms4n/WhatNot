const axios = require("axios");
const { config } = require("dotenv");
config();

const TEST_PHONE_NUMBER_ID = process.env.TEST_PHONE_NUMBER_ID;
const API_ACCESS_TOKEN = process.env.API_ACCESS_TOKEN;
const RECEIVER_PHONE_NUMBER = process.env.RECEIVER_PHONE_NUMBER;

const url = `https://graph.facebook.com/v16.0/${TEST_PHONE_NUMBER_ID}/messages`;

const headers = {
  Authorization: `Bearer ${API_ACCESS_TOKEN}`,
  "Content-Type": "application/json",
};

const data = {
  messaging_product: "whatsapp",
  to: RECEIVER_PHONE_NUMBER,
  type: "text",
  text: {
    preview_url: false,
    body: "This a custom text message",
  },
};

axios
  .post(url, data, { headers })
  .then((response) => console.log(response.status, response.data))
  .catch((error) => console.error(error));
