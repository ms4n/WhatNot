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

async function setParentFolderId(phoneNumber, parentFolderId) {
  const key = `parentFolderId:${phoneNumber}`;

  await redis.set(key, parentFolderId);
}

async function getParentFolderId(phoneNumber) {
  const key = `parentFolderId:${phoneNumber}`;

  const parentFolderId = await redis.get(key);
}

export { setAccessToken, getAccessToken, setParentFolderId, getParentFolderId };
