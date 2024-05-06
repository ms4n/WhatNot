import axios from "axios";
import mime from "mime-types";

import dotenv from "dotenv";
dotenv.config();

const WHATSAPP_API_ACCESS_TOKEN = process.env.WHATSAPP_API_ACCESS_TOKEN;
const parentFolderName = "WhatNot App";

import { getDriveService } from "../../config/googleApiConfig.mjs";

let driveService;
async function initializeDriveService(phoneNumber) {
  try {
    driveService = await getDriveService(phoneNumber);
  } catch (err) {
    console.error("Error initializing Drive service:", err);
    throw err;
  }
}

async function createDriveItem(
  itemMetadata,
  isFolder = false,
  parentFolderId = undefined,
  media = undefined
) {
  try {
    // Set MIME type based on whether it's a folder or file
    if (isFolder) {
      itemMetadata.mimeType = "application/vnd.google-apps.folder";
    }

    // Set parent folder if provided
    if (parentFolderId !== undefined) {
      itemMetadata.parents = [parentFolderId];
    }

    // If parent folder not provided, create or find one
    if (!parentFolderId && !isFolder) {
      const parentFolder = await findOrCreateFolder(parentFolderName);
      itemMetadata.parents = [parentFolder];
    }

    // Create file or folder based on metadata and media
    const driveItem = await driveService.files.create({
      resource: itemMetadata,
      media: media,
      fields: "id",
    });

    return driveItem.data.id;
  } catch (err) {
    console.error("Error creating/uploading drive item:", err);
    throw err;
  }
}

async function findDriveItem(
  itemName,
  itemMimeType,
  parentFolderId = undefined
) {
  try {
    // Escape single quotes in item name
    itemName = itemName.replace(/'/g, "\\'");

    // Construct the query string to search for the item
    const parentCondition =
      parentFolderId !== undefined ? `and '${parentFolderId}' in parents` : "";

    const queryString = `mimeType = '${itemMimeType}' and name = '${itemName}' ${parentCondition} and trashed = false`;

    // Query request to Google Drive API to search for the item
    const res = await driveService.files.list({
      q: queryString,
      spaces: "drive",
      fields: "nextPageToken, files(id, name)",
    });

    // Extract the ID of the found item, if any
    const items = res.data.files;
    const itemId = items.length > 0 ? items[0].id : null;

    return itemId;
  } catch (err) {
    console.error("Error finding drive item:", err);
    throw err;
  }
}

async function findOrCreateFolder(folderName, parentFolderId = undefined) {
  const folderMimeType = "application/vnd.google-apps.folder";

  // Try to find the folder
  let folderId = await findDriveItem(
    folderName,
    folderMimeType,
    parentFolderId
  );

  // If the folder doesn't exist, create it
  if (!folderId) {
    const folderMetadata = {
      name: folderName,
      mimeType: folderMimeType,
    };
    folderId = await createDriveItem(folderMetadata, true, parentFolderId);
  }

  return folderId;
}

async function findOrCreateFile(fileMetadata, parentFolderId = undefined) {
  // Try to find the file
  let fileId = await findDriveItem(
    fileMetadata.name,
    fileMetadata.mimeType,
    parentFolderId
  );

  // If the file doesn't exist, create it
  if (!fileId) {
    fileId = await createDriveItem(fileMetadata, false, parentFolderId);
  }

  return fileId;
}

async function handleWhatsAppMediaUpload(
  mediaObject,
  mediaType,
  fileName = undefined
) {
  try {
    // Check if media URL is available
    if (!mediaObject.url) {
      console.error("No media URL found in the message.");
      return;
    }

    // Download media from WhatsApp API
    const whatsappMediaResponse = await axios.get(mediaObject.url, {
      responseType: "stream",
      headers: {
        Authorization: `Bearer ${WHATSAPP_API_ACCESS_TOKEN}`,
      },
    });

    // Determine media MIME type
    const mimeType = mediaObject.mime_type;

    // Determine final file name
    const finalFileName = fileName
      ? fileName
      : `${mediaObject.id.substring(0, 5)}.${mime.extension(mimeType)}`;

    // Determine subfolder name based on media type
    const subFolderName = `${mediaType} files`;

    // Find or create parent folder and subfolder
    const parentFolderId = await findOrCreateFolder(parentFolderName);
    const subFolderId = await findOrCreateFolder(subFolderName, parentFolderId);

    // Prepare metadata for the file
    const fileMetadata = {
      name: finalFileName,
    };

    // Prepare media object for upload
    const media = {
      mimeType: mimeType,
      body: whatsappMediaResponse.data,
    };

    // Upload file to Google Drive
    await createDriveItem(fileMetadata, false, subFolderId, media);
  } catch (err) {
    console.error("Whatsapp Media download and upload to Drive Error: ", err);
    throw err;
  }
}

export {
  initializeDriveService,
  createDriveItem,
  findOrCreateFolder,
  findOrCreateFile,
  handleWhatsAppMediaUpload,
};

//Link example
// 1QL01r6djoIRia2gUj6ZxYHPks_w1WNJl
// https://drive.google.com/file/d/1QL01r6djoIRia2gUj6ZxYHPks_w1WNJl/view?usp=drive_link
