import { supabase } from "./supabase.mjs";

const saveOTP = async (phoneNumber, otp, otpExpirationTime) => {
  const { data, error } = await supabase.from("OTP").upsert(
    [
      {
        phone_number: phoneNumber,
        otp_code: otp,
        otp_expiration_time: otpExpirationTime,
      },
    ],
    {
      onConflict: ["phone_number"],
      returning: "minimal",
    }
  );

  if (error) {
    console.error("Error saving OTP:", error.message);
    throw new Error("Failed to save OTP");
  }

  return data;
};

const validateOTP = async (phoneNumber, userOTP) => {
  const { data, error } = await supabase
    .from("OTP")
    .select("otp_code, otp_expiration_time")
    .eq("phone_number", phoneNumber);

  if (error) {
    console.error("Error retrieving OTP:", error.message);
    throw new Error("Failed to retrieve OTP data: " + error.message);
  }

  // Check if data exists and has at least one entry
  if (data && data.length > 0) {
    const otpExpirationTime = new Date(data[0].otp_expiration_time);
    const currentTime = new Date();

    if (otpExpirationTime > currentTime) {
      return data[0].otp_code === userOTP;
    }
  }

  return false; // OTP validation failed or no OTP data found
};

const saveAccessToken = async (phoneNumber, accessToken) => {
  const { data, error } = await supabase
    .from("USER")
    .upsert([{ phone_number: phoneNumber, google_access_token: accessToken }], {
      onConflict: ["phone_number"],
      returning: "minimal",
    });

  if (error) {
    console.error("Error saving access token:", error.message);
    throw new Error("Failed to save access token");
  }

  return data;
};

export { saveOTP, validateOTP, saveAccessToken };
