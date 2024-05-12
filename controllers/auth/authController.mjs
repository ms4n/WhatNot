import {
  generateAuthUrl,
  getAuthTokens,
} from "../../services/googleAuthService.mjs";
import {
  checkVerifiedPhoneNumber,
  saveGoogleTokens,
} from "../../database/db.mjs";

async function handleOAuthCallback(req, res) {
  try {
    const authorizationCode = req.query.code;
    const tokens = await getAuthTokens(authorizationCode);

    const phoneNumber = await req.session.phoneNumber;
    console.log("handleOAuthCallback", phoneNumber);

    await saveGoogleTokens(phoneNumber, tokens);

    res.redirect("https://whatnotapp.vercel.app/success");
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function handleOAuthUrlGeneration(req, res) {
  try {
    const phoneNumber = req.headers["phonenumber"];
    req.session.phoneNumber = phoneNumber;

    console.log("handleOAuthUrlGeneration:", req.session.phoneNumber);

    const isPhoneNumberVerified = await checkVerifiedPhoneNumber(phoneNumber);

    if (!isPhoneNumberVerified) {
      // Phone number is not verified or not found
      return res.status(403).json({ message: "Phone number not verified!" });
    }

    // Phone number is verified, generate the authentication URL
    const authUrl = generateAuthUrl();
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
