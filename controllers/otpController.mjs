import otpServices from "../services/otpServices.mjs";
import Axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const access_token = process.env.ACCESS_TOKEN;
const phone_no_id = process.env.PHONE_NUMBER_ID;

const handleOTPGeneration = async (phoneNumber) => {
  const OTP = otpServices.generateAndSaveOTP(phoneNumber);
  const otpMessage = `Your one-time password (OTP) for Whatnot signup is: ${OTP}. This OTP is valid for 5 minutes.`;

  try {
    const response = await Axios.post(
      `https://graph.facebook.com/v17.0/${phone_no_id}/messages?access_token=${access_token}`,
      {
        messaging_product: "whatsapp",
        to: phoneNumber,
        text: {
          body: otpMessage,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Extract necessary information from the response
    const responseData = {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };

    return {
      success: true,
      message: "OTP generated successfully",
      response: responseData,
    };
  } catch (error) {
    console.error("Error sending message:", error);
    // Extract status code from error if available
    const statusCode = error.response ? error.response.status : 500;

    // Handle error here
    return {
      success: false,
      message: "Failed to generate OTP",
      error,
      statusCode,
    };
  }
};

const handleOTPValidation = async (phoneNumber, userOTP) => {
  const isValid = await otpServices.validateOTP(phoneNumber, userOTP);

  if (isValid) {
    return { message: "OTP validation successful", valid: true };
  } else {
    return { message: "Invalid OTP. Please try again.", valid: false };
  }
};

const otpController = {
  handleOTPGeneration,
  handleOTPValidation,
};

export default otpController;
