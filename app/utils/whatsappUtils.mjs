import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const WHATSAPP_API_ACCESS_TOKEN = process.env.WHATSAPP_API_ACCESS_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;
const whatsappApiUrl = "https://graph.facebook.com/v20.0/";

async function getMediaObjectFromId(mediaId) {
  const media_url = `${whatsappApiUrl}${mediaId}`;
  const headers = {
    Authorization: `Bearer ${WHATSAPP_API_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };

  try {
    const res = await axios.get(media_url, { headers });
    return res.data;
  } catch (error) {
    console.error("Could not get media object:", error.response.data);
    throw error; // rethrow the error to be handled by the caller
  }
}

async function sendReactionMessage(toPhoneNumber, messageId, emoji) {
  const message_url = `${whatsappApiUrl}${phoneNumberId}/messages`;
  const headers = {
    Authorization: `Bearer ${WHATSAPP_API_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };

  const data = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: toPhoneNumber,
    type: "reaction",
    reaction: {
      message_id: messageId,
      emoji: emoji,
    },
  };

  try {
    const res = await axios.post(message_url, data, { headers });
    return res;
  } catch (error) {
    console.error("Error sending reaction message:", error);
    throw error;
  }
}

async function sendTextMessage(toPhoneNumber, messageBody) {
  const message_url = `${whatsappApiUrl}${phoneNumberId}/messages`;
  const headers = {
    Authorization: `Bearer ${WHATSAPP_API_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };

  const data = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: toPhoneNumber,
    type: "text",
    text: {
      body: messageBody,
    },
  };

  try {
    const res = await axios.post(message_url, data, { headers });
    return res;
  } catch (error) {
    console.error("Error sending text message:", error);
    throw error;
  }
}

async function sendReminderMessage(toPhoneNumber, reminderText) {
  const message_url = `${whatsappApiUrl}${phoneNumberId}/messages`;
  const headers = {
    Authorization: `Bearer ${WHATSAPP_API_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };

  const data = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: toPhoneNumber,
    type: "template",
    template: {
      name: "whatnot_reminder",
      language: {
        code: "en",
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: reminderText,
            },
          ],
        },
      ],
    },
  };

  try {
    const res = await axios.post(message_url, data, { headers });
    return res;
  } catch (error) {
    console.error("Error sending reminder message:", error);
    throw error;
  }
}

export {
  getMediaObjectFromId,
  sendReactionMessage,
  sendTextMessage,
  sendReminderMessage,
};

// curl -X  POST \
//  'https://graph.facebook.com/v20.0/FROM_PHONE_NUMBER_ID/messages' \
//  -H 'Authorization: Bearer ACCESS_TOKEN' \
//  -H 'Content-Type: application/json' \
//  -d '{
//   "messaging_product": "whatsapp",
//   "recipient_type": "individual",
//   "to": "PHONE_NUMBER",
//   "type": "template",
//   "template": {
//     "name": "reminder",
//     "language": {
//       "code": "en_US"
//     },
//     "components": [
//       {           "text": "text-string"
//           },

//         ]
//       }
//     ]
//   }
// }'

//       }
//     ]
//   }
// }'
