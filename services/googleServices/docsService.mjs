import { findOrCreateFile } from "./driveService.mjs";
import { getDocsService } from "../../config/googleApiConfig.mjs";

let docsService;

async function initializeDocsService(phoneNumber) {
  try {
    docsService = await getDocsService(phoneNumber);
  } catch (err) {
    console.error("Error initializing Docs service:", err);
    throw err;
  }
}

async function writeMessageToDocs(message, timestamp) {
  try {
    const fileMetadata = {
      name: "Whatsapp NoteSync",
      mimeType: "application/vnd.google-apps.document",
    };

    const docFile = await findOrCreateFile(fileMetadata);

    // console.log(docFile);

    const date = new Date(timestamp * 1000);
    const formattedDate = date.toLocaleDateString("en-us", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // add hours and minutes:
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const formattedTime = `${hours}:${minutes}`;

    const requests = [
      {
        insertText: {
          endOfSegmentLocation: { segmentId: "" }, // Appends to the body segment
          text: `Date: ${formattedTime}, ${formattedDate} \n${message}\n\n`,
        },
      },
    ];

    const doc = await docsService.documents.batchUpdate({
      documentId: docFile,
      resource: { requests: requests },
    });

    return doc.status;
  } catch (error) {
    console.error("Error writing message to Google Docs:", error);
    throw error; // rethrow the error to be handled by the caller
  }
}

export { initializeDocsService, writeMessageToDocs };
