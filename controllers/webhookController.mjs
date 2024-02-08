import { Axios } from "axios";
import messageController from "./messageController.mjs";
import dotenv from "dotenv";

dotenv.config();

const access_token = process.env.ACCESS_TOKEN;

async function processMessage(body) {
  if (
    body.object &&
    body.entry &&
    body.entry[0].changes &&
    body.entry[0].changes[0].value.messages &&
    body.entry[0].changes[0].value.messages[0]
  ) {
    const phone_no_id = body.entry[0].changes[0].value.metadata.phone_number_id;
    const from_phone_no = body.entry[0].changes[0].value.messages[0].from;
    const message_body = body.entry[0].changes[0].value.messages[0].text.body;

    const responseMessage = messageController.getResponseMessage(message_body);

    await Axios.post(
      `https://graph.facebook.com/v17.0/${phone_no_id}/messages?access_token=${access_token}`,
      {
        messaging_product: "whatsapp",
        to: from_phone_no,
        text: {
          body: responseMessage,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export default { processMessage };
