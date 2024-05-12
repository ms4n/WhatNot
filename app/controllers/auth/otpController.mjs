import otpService from "../../services/otpService.mjs";
import { saveVerifiedPhoneNumber } from "../../../database/db.mjs";
import { sendTextMessage } from "../../utils/whatsappUtils.mjs";

const handleOTPGeneration = async (phoneNumber) => {
  const OTP = await otpService.generateAndSaveOTP(phoneNumber);
  const otpMessage = `Your one-time password (OTP) for Whatnot signup is: ${OTP}. This OTP is valid for 5 minutes.`;

  try {
    const response = await sendTextMessage(phoneNumber, otpMessage);

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
  const isValid = await otpService.validateOTP(phoneNumber, userOTP);

  if (isValid) {
    try {
      await saveVerifiedPhoneNumber(phoneNumber);
      return { message: "OTP validation successful", valid: true };
    } catch (error) {
      console.error(error);
      return {
        message: "Error validating OTP, please try again.",
        valid: false,
      };
    }
  } else {
    return { message: "Invalid OTP. Please try again.", valid: false };
  }
};

const otpController = {
  handleOTPGeneration,
  handleOTPValidation,
};

export default otpController;
