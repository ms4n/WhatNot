import { findOrCreateFile } from "./driveService.mjs";
import { getDocsService } from "../../../config/googleApiConfig.mjs";
import { getDocId, setDocId } from "../../utils/redisUtils.mjs";

let docsService; // Variable to store the initialized Google Docs service

// Function to initialize the Google Docs service
async function initializeDocsService(phoneNumber) {
  try {
    // Get the Google Docs service using the provided phone number
    docsService = await getDocsService(phoneNumber);
  } catch (err) {
    // Handle errors that occur during initialization
    console.error("Error initializing Docs service:", err);
    throw err; // Rethrow the error to be handled by the caller
  }
}

// Function to write a message to a Google Docs document
async function writeMessageToDocs(phoneNumber, message, timestamp) {
  try {
    // Define metadata for the Google Docs file
    const fileMetadata = {
      name: "Whatsapp Notes",
      mimeType: "application/vnd.google-apps.document",
    };

    // Find or create the Google Docs file
    let docFile = await getDocId(phoneNumber);

    if (!docFile) {
      docFile = await findOrCreateFile(phoneNumber, fileMetadata);
      await setDocId(phoneNumber, docFile);
    }

    // Format the timestamp into human-readable date and time
    const date = new Date(timestamp * 1000);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Calcutta",
    };

    const formattedDateAndTime = date.toLocaleDateString("en-US", options);

    // Define requests to insert text into the Google Docs file
    const requests = [
      {
        insertText: {
          endOfSegmentLocation: { segmentId: "" },
          text: `Date: ${formattedDateAndTime} \n${message}\n\n`,
        },
      },
    ];

    // Batch update the Google Docs document with the message
    const doc = await docsService.documents.batchUpdate({
      documentId: docFile,
      resource: { requests: requests },
    });

    // Return the status of the document update
    return doc.status;
  } catch (error) {
    // Handle errors that occur during writing to Google Docs
    console.error("Error writing message to Google Docs:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}

export { initializeDocsService, writeMessageToDocs };
