import mime from "mime-types";

import { getDriveService } from "../config/googleApiConfig.mjs";

export function generateFileName(messageObject) {
  const idSubstring = messageObject.id.substring(0, 5);
  const mimeExtension = mime.extension(messageObject.mime_type);
  return `${idSubstring}.${mimeExtension}`;
}

export function determineSubfolderName(mimeType) {
  return `${mimeType.split("/")[0]} files`;
}
