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

// Object containing response messages for different scenarios
const RESPONSE_MESSAGES = {
  WELCOME_LINK:
    "Hello! 👋 Welcome to Whatnot! To get started, please sign up here: https://whatnotapp.vercel.app/signup. We're excited to have you on board!",
  DEFAULT:
    "Sorry, we currently only support text, image, document, audio, and video messages. If you haven't signed up to WhatNot App yet, you can do so here: https://whatnotapp.vercel.app/signup.",
};

// Function to handle incoming messages
async function handleIncomingMessage(message) {
  // Switch based on the type of the message
  switch (message.type) {
    case "text":
      return handleTextMessage(message); // Handle text messages
    case "image":
    case "document":
    case "audio":
    case "video":
      return handleMediaMessage(message); // Handle media messages
    default:
      return handleDefaultMessage(message); // Handle default messages
  }
}

// Function to handle text messages
async function handleTextMessage(message) {
  // Extract necessary information from the message
  const text = message.text.body.trim();
  const fromPhoneNumber = message.from;
  const timestamp = message.timestamp;
  const messageId = message.id;

  try {
    // Check if the text message is a greeting
    if (text === "Hello! 👋") {
      // Send a welcome message
      await sendTextMessage(fromPhoneNumber, RESPONSE_MESSAGES.WELCOME_LINK);
    } else if (text.toLowerCase().startsWith("/cal")) {
      // Check if the text message is a calendar event request
      await initializeCalendarService(fromPhoneNumber); // Initialize Google Calendar service

      // Create a calendar event based on the message content
      const eventResponse = await createCalendarEvent(text);
      if (eventResponse === 200) {
        // If the event creation is successful, send a confirmation message
        await sendReactionMessage(fromPhoneNumber, messageId, "✅");
      }
    } else {
      // If it's not a greeting or a calendar event, handle as a regular message
      await initializeDriveService(fromPhoneNumber); // Initialize Google Drive service
      await initializeDocsService(fromPhoneNumber); // Initialize Google Docs service

      // Write the message to a Google Docs document
      const docsResposne = await writeMessageToDocs(text, timestamp);
      if (docsResposne === 200) {
        // If writing to Docs is successful, send a confirmation message
        await sendReactionMessage(fromPhoneNumber, messageId, "✅");
      }
    }
  } catch (error) {
    // Handle errors that occur during message handling
    console.error("Error occurred while handling text message:", error);
  }
}

// Function to handle media messages
async function handleMediaMessage(message) {
  // Extract necessary information from the message
  const mediaType = message.type;
  const mediaId = message[mediaType].id;
  const fromPhoneNumber = message.from;
  const messageId = message.id;

  try {
    // Initialize Google Drive service
    await initializeDriveService(fromPhoneNumber);
    // Get the media object from its ID
    const mediaObject = await getMediaObjectFromId(mediaId);

    // Handle media upload to Google Drive
    const mediaUploadResponse = await handleWhatsAppMediaUpload(
      mediaObject,
      mediaType,
      mediaType === "document" ? message.document.filename : undefined
    );

    if (mediaUploadResponse === 200) {
      // If media upload is successful, send a confirmation message
      await sendReactionMessage(fromPhoneNumber, messageId, "✅");
    }
  } catch (error) {
    // Handle errors that occur during media handling
    console.error(error);
    throw error;
  }
}

// Function to handle default messages
async function handleDefaultMessage(message) {
  // Extract necessary information from the message
  const fromPhoneNumber = message.from;
  // Send a default response message
  await sendTextMessage(fromPhoneNumber, RESPONSE_MESSAGES.DEFAULT);
}

export default { handleIncomingMessage };
