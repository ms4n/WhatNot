import {
  getMediaObjectFromId,
  sendReactionMessage,
} from "../../utils/whatsappUtils.mjs";
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

async function handleIncomingMessage(message) {
  switch (message.type) {
    case "text":
      return handleTextMessage(message);
    case "image":
    case "document":
    case "audio":
    case "video":
      return handleMediaMessage(message);
    default:
      return handleDefaultMessage(message);
  }
}

async function handleTextMessage(message) {
  const text = message.text.body;
  const fromPhoneNumber = message.from;
  const timestamp = message.timestamp;
  const messageId = message.id;

  if (text === "Hello! 👋") {
    return RESPONSE_MESSAGES.WELCOME_LINK;
  } else {
    try {
      await initializeDriveService(fromPhoneNumber);
      await initializeDocsService(fromPhoneNumber);

      const docsResposne = await writeMessageToDocs(text, timestamp);
      if (docsResposne === 200) {
        await sendReactionMessage(fromPhoneNumber, messageId);
      }
    } catch (error) {
      console.error(
        "Error occurred while attempting to send reply message to WhatsApp:",
        error
      );
    }
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

async function handleDefaultMessage(message) {}

export default { handleIncomingMessage };
