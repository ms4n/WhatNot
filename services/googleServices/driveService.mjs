import axios from "axios";
import mime from "mime-types";

import dotenv from "dotenv";
dotenv.config();

const WHATSAPP_API_ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const parentFolderName = "WhatNot App";

import { getDriveService } from "../../config/googleApiConfig.mjs";

let driveService;

async function initializeDriveService(phoneNumber) {
  try {
    driveService = await getDriveService(phoneNumber);
  } catch (error) {
    console.error("Error initializing Drive service:", error);
    throw error;
  }
}

async function findFolder(folderName, parentFolderId = undefined) {
  folderName = folderName.replace(/'/g, "\\'");

  const parentCondition =
    parentFolderId !== undefined ? `and '${parentFolderId}' in parents` : "";

  const queryString = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' ${parentCondition}`;

  try {
    const res = await driveService.files.list({
      q: queryString,
      spaces: "drive",
      fields: "nextPageToken, files(id, name)",
    });

    const files = res.data.files;
    const folderId = files.length > 0 ? files[0].id : null;

    return folderId;
  } catch (err) {
    console.error(err);
  }
}

async function createFolder(folderName, parentFolderId = undefined) {
  const fileMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };

  if (parentFolderId !== undefined) {
    fileMetadata.parents = [parentFolderId];
  }

  try {
    const file = await driveService.files.create({
      resource: fileMetadata,
      fields: "id",
    });
    return file.data.id;
  } catch (err) {
    console.error(err.errors);
    throw err;
  }
}

async function findOrCreateFolder(folderName, parentFolderId = undefined) {
  let folderId = await findFolder(folderName, parentFolderId);
  if (!folderId) {
    folderId = await createFolder(folderName, parentFolderId);
  }
  return folderId;
}

async function handleWhatsAppMediaUpload(messageObject, phoneNumber) {
  try {
    if (!messageObject.url) {
      console.error("No media URL found in the message.");
      return;
    }

    const whatsappMediaResponse = await axios.get(messageObject.url, {
      responseType: "stream",
      headers: {
        Authorization: `Bearer ${WHATSAPP_API_ACCESS_TOKEN}`,
      },
    });

    const mimeType = messageObject.mime_type;

    const fileName = `${messageObject.id.substring(0, 5)}.${mime.extension(
      mimeType
    )}`;

    const subFolderName = `${mimeType.split("/")[0]} files`;

    const parentFolderId = await findOrCreateFolder(parentFolderName);
    const subFolderId = await findOrCreateFolder(subFolderName, parentFolderId);

    const fileMetadata = {
      name: fileName,
      parents: [subFolderId],
    };

    const media = {
      mimeType: mimeType,
      body: whatsappMediaResponse.data,
    };

    const file = await driveService.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });
  } catch (err) {
    console.error("Whatsapp Media download and upload to Drive Error: ", err);
    throw err;
  }
}

export { initializeDriveService, handleWhatsAppMediaUpload };
