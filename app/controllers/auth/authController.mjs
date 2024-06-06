import {
  generateAuthUrl,
  getAuthTokens,
} from "../../services/googleAuthService.mjs";

import {
  checkVerifiedPhoneNumber,
  saveGoogleTokens,
} from "../../../database/db.mjs";

import { randomUUID } from "crypto";

import redis from "../../../config/redisConfig.mjs";
import { setAccessToken } from "../../utils/redisUtils.mjs";

async function handleOAuthCallback(req, res) {
  try {
    const authorizationCode = req.query.code;
    const tokens = await getAuthTokens(authorizationCode);

    const uuidToken = req.query.state;
    const phoneNumber = await redis.get(uuidToken);

    await setAccessToken(phoneNumber, tokens.access_token);
    await saveGoogleTokens(phoneNumber, tokens);

    res.redirect("https://whatnotapp.xyz/success");
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function handleOAuthUrlGeneration(req, res) {
  try {
    const phoneNumber = req.headers["phonenumber"];
    const uuidToken = randomUUID();

    const isPhoneNumberVerified = await checkVerifiedPhoneNumber(phoneNumber);

    if (!isPhoneNumberVerified) {
      // Phone number is not verified or not found
      return res.status(403).json({ message: "Phone number not verified!" });
    }

    await redis.set(uuidToken, phoneNumber);
    await redis.expire(uuidToken, 86400); //expires after a day

    // Phone number is verified, generate the authentication URL
    const authUrl = generateAuthUrl(uuidToken);
    res.json({ authUrl: authUrl });
  } catch (error) {
    console.error("Error generating Oauth URL: ", error);
  }
}

const authController = {
  handleOAuthCallback,
  handleOAuthUrlGeneration,
  generateAuthUrl,
};

export default authController;
