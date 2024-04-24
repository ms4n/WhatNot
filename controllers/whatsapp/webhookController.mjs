import axios from "axios";
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
    const messageObject = body.entry[0].changes[0].value.messages[0];
    console.log(messageObject);

    const phoneNumberId =
      body.entry[0].changes[0].value.metadata.phone_number_id;
    const fromPhoneNumber = body.entry[0].changes[0].value.messages[0].from;

    const responseMessage =
      await messageController.getResponseMessage(messageObject);

    await axios.post(
      `https://graph.facebook.com/v17.0/${phoneNumberId}/messages?access_token=${access_token}`,
      {
        messaging_product: "whatsapp",
        to: fromPhoneNumber,
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

//Example Text Message Object

// {
//   from: '917892763027',
//   id: 'wamid.HBgMOTE3ODkyNzYzMDI3FQIAEhgUM0FENDU3MTA1NUMzRUQ0NjUwODkA',
//   timestamp: '1713912452',
//   text: { body: 'Hello' },
//   type: 'text'
// }

//Example Image Media Message Object

// {
//   from: '917892763027',
//   id: 'wamid.HBgMOTE3ODkyNzYzMDI3FQIAEhgUM0FCOTc0QzVEODE0REY2NjkzMjAA',
//   timestamp: '1713912338',
//   type: 'image',
//   image: {
//     mime_type: 'image/jpeg',
//     sha256: 'tnlSjA916IQ61DZTHkwZ+/exfAnrsdOh/EvmZHrp1qY=',
//     id: '1558044654740052'
//   }
// }

//Example Document Media Message Object

// {
//   from: '917892763027',
//   id: 'wamid.HBgMOTE3ODkyNzYzMDI3FQIAEhgUM0FDMUJFN0YzNzg4Njc1NjhEOEEA',
//   timestamp: '1713912665',
//   type: 'document',
//   document: {
//     filename: 'DSA_CheatSheet_1669741975.pdf',
//     mime_type: 'application/pdf',
//     sha256: 'G8jv7KqDTV1LhVheeI0JgIMUJmqS/helcLr21lYzxrU=',
//     id: '1393229714708381'
//   }
// }

////Example Audio Media Message Object

// {
//   from: '917892763027',
//   id: 'wamid.HBgMOTE3ODkyNzYzMDI3FQIAEhgUM0EwMTZGRERGNzI1OUY4MjZGRjUA',
//   timestamp: '1713913288',
//   type: 'audio',
//   audio: {
//     mime_type: 'audio/ogg; codecs=opus',
//     sha256: '9tpu1UXOg9xHUAQoboDC4cq+ZZcCWE+fcyGkv7ZAuok=',
//     id: '250540228080168',
//     voice: true
//   }
// }

//Example Video Media Message Object

// {
//   from: '917892763027',
//   id: 'wamid.HBgMOTE3ODkyNzYzMDI3FQIAEhgUM0FDOEMwOTY4MDFCRDBEMzZFMDIA',
//   timestamp: '1713913403',
//   type: 'video',
//   video: {
//     mime_type: 'video/mp4',
//     sha256: 'P02TA2YjkxUjnms0Y8v2elkiloFWNxO8nFHaYgroVrM=',
//     id: '1475039849801235'
//   }
// }
