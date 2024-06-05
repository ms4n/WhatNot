import redis from "../../config/redisConfig.mjs";

async function setAccessToken(phoneNumber, accessToken) {
  const key = phoneNumber;

  // Set the access token in Redis hash
  await redis.hset(key, "accessToken", accessToken);

  // Access tokens expire after 60 minutes, setting it to 58 minutes allows for renewal before expiration
  await redis.expire(key, 58 * 60);
}

async function getAccessToken(phoneNumber) {
  const key = phoneNumber;
  return await redis.hget(key, "accessToken");
}

async function setMainFolderId(phoneNumber, folderId) {
  const key = phoneNumber;
  await redis.hset(key, "mainFolderId", folderId);
}

async function getMainFolderId(phoneNumber) {
  const key = phoneNumber;
  return await redis.hget(key, "mainFolderId");
}

async function setImageFilesFolderId(phoneNumber, folderId) {
  const key = phoneNumber;
  await redis.hset(key, "imageFilesFolderId", folderId);
}

async function getImageFilesFolderId(phoneNumber) {
  const key = phoneNumber;
  return await redis.hget(key, "imageFilesFolderId");
}

async function setVideoFilesFolderId(phoneNumber, folderId) {
  const key = phoneNumber;
  await redis.hset(key, "videoFilesFolderId", folderId);
}

async function getVideoFilesFolderId(phoneNumber) {
  const key = phoneNumber;
  return await redis.hget(key, "videoFilesFolderId");
}

async function setAudioFilesFolderId(phoneNumber, folderId) {
  const key = phoneNumber;
  await redis.hset(key, "audioFilesFolderId", folderId);
}

async function getAudioFilesFolderId(phoneNumber) {
  const key = phoneNumber;
  return await redis.hget(key, "audioFilesFolderId");
}

async function setDocumentFilesFolderId(phoneNumber, folderId) {
  const key = phoneNumber;
  await redis.hset(key, "documentFilesFolderId", folderId);
}

async function getDocumentFilesFolderId(phoneNumber) {
  const key = phoneNumber;
  return await redis.hget(key, "documentFilesFolderId");
}

async function setDocId(phoneNumber, docId) {
  const key = phoneNumber;
  await redis.hset(key, "docId", docId);
}

async function getDocId(phoneNumber) {
  const key = phoneNumber;
  return await redis.hget(key, "docId");
}

export {
  setAccessToken,
  getAccessToken,
  setMainFolderId,
  getMainFolderId,
  setImageFilesFolderId,
  getImageFilesFolderId,
  setVideoFilesFolderId,
  getVideoFilesFolderId,
  setAudioFilesFolderId,
  getAudioFilesFolderId,
  setDocumentFilesFolderId,
  getDocumentFilesFolderId,
  setDocId,
  getDocId,
};
