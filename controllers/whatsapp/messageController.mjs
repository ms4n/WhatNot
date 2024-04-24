import { getMediaObjectFromId } from "../../utils/whatsappUtils.mjs";
import {
  initializeDriveService,
  handleWhatsAppMediaUpload,
} from "../../services/googleServices/driveService.mjs";

const RESPONSE_MESSAGES = {
  HELLO: "Hello! 👋 How can I assist you?",
  GOODBYE: "Goodbye! Have a great day!",
  DEFAULT: "Thank you for your message!",
  WELCOME_LINK:
    "Hello! 👋 Welcome to Whatnot! To get started, please sign up here: https://whatnotapp.vercel.app/signup. We're excited to have you on board!",
};

function getResponseMessage(message) {
  switch (message.type) {
    case "text":
      return handleTextMessage(message);
    case "image":
    case "document":
    case "audio":
    case "video":
      return handleMediaMessage(message);
    default:
      return RESPONSE_MESSAGES.DEFAULT;
  }
}

async function handleTextMessage(message) {
  const text = message.text.body;
  if (text === "Hello! 👋") {
    return RESPONSE_MESSAGES.WELCOME_LINK;
  } else if (text.includes("goodbye")) {
    return RESPONSE_MESSAGES.GOODBYE;
  } else {
    return RESPONSE_MESSAGES.DEFAULT;
  }
}

async function handleMediaMessage(message) {
  try {
    await initializeDriveService(message.from);
    const mediaObject = await getMediaObjectFromId(message.image.id);

    await handleWhatsAppMediaUpload(mediaObject);
    const responseMessage = `Uploaded to Google Drive!`;
    return responseMessage;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default { getResponseMessage };
