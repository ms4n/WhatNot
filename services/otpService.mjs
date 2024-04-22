import { saveOTP, validateOTP } from "../database/db.mjs";

const generateAndSaveOTP = (phoneNumber) => {
  const digits = "0123456789"; // Define the characters to use for OTP
  let OTP = "";
  const otpLength = 6;
  for (let i = 0; i < otpLength; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }

  const otpExpirationTime = new Date();
  otpExpirationTime.setMinutes(otpExpirationTime.getMinutes() + 5);

  saveOTP(phoneNumber, OTP, otpExpirationTime);

  return OTP;
};

const otpService = {
  generateAndSaveOTP,
  validateOTP,
};

export default otpService;
