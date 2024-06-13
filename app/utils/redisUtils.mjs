import redis from "../../config/redisConfig.mjs";
import { renewGoogleAccessToken } from "../../database/db.mjs";

async function setAccessToken(phoneNumber, accessToken) {
  const key = `accessToken:${phoneNumber}`;
  // Access tokens expire after 60 minutes, setting it to 58 minutes allows for renewal before expiration
  await redis.set(key, accessToken, "EX", 58 * 60);
}

async function getAccessToken(phoneNumber) {
  const key = `accessToken:${phoneNumber}`;
  let accessToken = await redis.get(key);

  if (!accessToken) {
    accessToken = await renewGoogleAccessToken(phoneNumber);
    await setAccessToken(phoneNumber, accessToken);
  }

  return accessToken;
}

async function setMainFolderId(phoneNumber, folderId) {
  const key = `driveIds:${phoneNumber}`;
  await redis.hset(key, "mainFolderId", folderId);
}

async function getMainFolderId(phoneNumber) {
  const key = `driveIds:${phoneNumber}`;
  return await redis.hget(key, "mainFolderId");
}

async function setSubFolderId(phoneNumber, folderName, folderId) {
  const key = `driveIds:${phoneNumber}`;
  await redis.hset(key, folderName.replace(/\s+/g, "") + "FolderId", folderId);
}

async function getSubFolderId(phoneNumber, folderName) {
  const key = `driveIds:${phoneNumber}`;
  const folderIdFieldName = folderName.replace(/\s+/g, "") + "FolderId";
  return await redis.hget(key, folderIdFieldName);
}

async function setDocId(phoneNumber, docId) {
  const key = `driveIds:${phoneNumber}`;
  await redis.hset(key, "docId", docId);
}

async function getDocId(phoneNumber) {
  const key = `driveIds:${phoneNumber}`;
  return await redis.hget(key, "docId");
}

export {
  setAccessToken,
  getAccessToken,
  setMainFolderId,
  getMainFolderId,
  getSubFolderId,
  setSubFolderId,
  setDocId,
  getDocId,
};
