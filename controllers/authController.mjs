import axios from "axios";
import {
  generateAuthUrl,
  getAuthTokens,
} from "../services/googleAuthServices.mjs";

async function handleOAuthCallback(req, res) {
  try {
    const authorizationCode = req.query.code;
    const accessToken = await getAuthTokens(authorizationCode);

    const phoneNumber = req.session.phoneNumber;

    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken.access_token}`,
        },
      }
    );

    res.redirect("http://localhost:3000/success"); // Or a success page of your choice
  } catch (error) {
    console.error("Error fetching email:", error);
    // Handle error appropriately (redirect to error page, etc.)
  }
}

const authController = {
  handleOAuthCallback,
  generateAuthUrl,
};

export default authController;
