import { getMediaObjectFromId } from "../../utils/whatsappUtils.mjs";
import {
  initializeDriveService,
  handleWhatsAppMediaUpload,
} from "../../services/googleServices/driveService.mjs";

import {
  initializeDocsService,
  writeMessageToDocs,
} from "../../services/googleServices/docsService.mjs";

const RESPONSE_MESSAGES = {
  HELLO: "Hello! 👋 How can I assist you?",
  GOODBYE: "Goodbye! Have a great day!",
  DEFAULT: "Message added to docs.",
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
  const fromPhoneNumber = message.from;
  const timestamp = message.timestamp;

  if (text === "Hello! 👋") {
    return RESPONSE_MESSAGES.WELCOME_LINK;
  } else if (text.includes("goodbye")) {
    return RESPONSE_MESSAGES.GOODBYE;
  } else {
    try {
      await initializeDriveService(fromPhoneNumber);
      await initializeDocsService(fromPhoneNumber);

      await writeMessageToDocs(text, timestamp);
      return RESPONSE_MESSAGES.DEFAULT;
    } catch (error) {}
  }
}

async function handleMediaMessage(message) {
  const mediaType = message.type;
  const mediaId = message[mediaType].id;
  const fromPhoneNumber = message.from;
  try {
    await initializeDriveService(fromPhoneNumber);
    const mediaObject = await getMediaObjectFromId(mediaId);

    await handleWhatsAppMediaUpload(
      mediaObject,
      mediaType,
      mediaType === "document" ? message.document.filename : undefined
    );

    const responseMessage = `Media uploaded to Google Drive`;
    return responseMessage;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default { getResponseMessage };
