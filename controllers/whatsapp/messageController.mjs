import {
  getMediaObjectFromId,
  sendReactionMessage,
  sendTextMessage,
} from "../../utils/whatsappUtils.mjs";

import {
  initializeDriveService,
  handleWhatsAppMediaUpload,
} from "../../services/googleServices/driveService.mjs";

import {
  initializeDocsService,
  writeMessageToDocs,
} from "../../services/googleServices/docsService.mjs";
import {
  createCalendarEvent,
  initializeCalendarService,
} from "../../services/googleServices/calendarService.mjs";

const RESPONSE_MESSAGES = {
  DEFAULT:
    "Sorry, we currently only support text, image, document, audio, and video messages. If you haven't signed up to WhatNot App yet, you can do so here: https://whatnotapp.vercel.app/signup.",
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
  const text = message.text.body.trim();
  const fromPhoneNumber = message.from;
  const timestamp = message.timestamp;
  const messageId = message.id;

  try {
    if (text === "Hello! 👋") {
      await sendTextMessage(fromPhoneNumber, RESPONSE_MESSAGES.WELCOME_LINK);
    } else if (text.toLowerCase().startsWith("/cal")) {
      await initializeCalendarService(fromPhoneNumber);

      const eventResponse = await createCalendarEvent(text);
      if (eventResponse === 200) {
        await sendReactionMessage(fromPhoneNumber, messageId, "✅");
      }
    } else {
      await initializeDriveService(fromPhoneNumber);
      await initializeDocsService(fromPhoneNumber);

      const docsResposne = await writeMessageToDocs(text, timestamp);
      if (docsResposne === 200) {
        await sendReactionMessage(fromPhoneNumber, messageId, "✅");
      }
    }
  } catch (error) {
    console.error("Error occurred while handling text message:", error);
  }
}

async function handleMediaMessage(message) {
  const mediaType = message.type;
  const mediaId = message[mediaType].id;
  const fromPhoneNumber = message.from;
  const messageId = message.id;

  try {
    await initializeDriveService(fromPhoneNumber);
    const mediaObject = await getMediaObjectFromId(mediaId);

    const mediaUploadResponse = await handleWhatsAppMediaUpload(
      mediaObject,
      mediaType,
      mediaType === "document" ? message.document.filename : undefined
    );

    if (mediaUploadResponse === 200) {
      await sendReactionMessage(fromPhoneNumber, messageId, "✅");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function handleDefaultMessage(message) {
  const fromPhoneNumber = message.from;
  await sendTextMessage(fromPhoneNumber, RESPONSE_MESSAGES.DEFAULT);
}

export default { handleIncomingMessage };
