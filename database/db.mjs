import { supabase } from "./supabase.mjs";

const saveOTP = async (phoneNumber, otp, otpExpirationTime) => {
  try {
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
  } catch (error) {
    console.error("Error saving OTP:", error.message);
    throw error;
  }
};

const validateOTP = async (phoneNumber, userOTP) => {
  try {
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
  } catch (error) {
    console.error("Error validating OTP:", error.message);
    throw error;
  }
};

const saveVerifiedPhoneNumber = async (phoneNumber) => {
  try {
    const { data, error } = await supabase
      .from("USER")
      .upsert([{ phone_number: phoneNumber }], {
        onConflict: ["phone_number"],
        returning: "minimal",
      });

    if (error) {
      console.error("Error saving verified phone number: ", error.message);
      throw new Error("Failed to save verified phone number");
    }

    return data;
  } catch (error) {
    console.error("Error saving verified phone number: ", error.message);
    throw error;
  }
};

const checkVerifiedPhoneNumber = async (phoneNumber) => {
  try {
    const { data, error } = await supabase
      .from("USER")
      .select()
      .eq("phone_number", phoneNumber);

    if (error) {
      console.error("Error checking verified phone number: ", error.message);
      throw new Error("Failed to check verified phone number");
    }

    // Return true if data array is not empty (phone number exists), false otherwise
    return data.length > 0;
  } catch (error) {
    console.error("Error checking verified phone number: ", error.message);
    throw error;
  }
};

const saveGoogleTokens = async (phoneNumber, tokens) => {
  try {
    const upsertData = {
      phone_number: phoneNumber,
      google_access_token: tokens.access_token,
      google_access_token_expiry_date: tokens.expiry_date,
    };

    if (tokens.refresh_token) {
      upsertData.google_refresh_token = tokens.refresh_token;
    }

    const { data, error } = await supabase.from("USER").upsert([upsertData], {
      onConflict: ["phone_number"],
      returning: "minimal",
    });

    if (error) {
      console.error("Error saving google oauth tokens:", error.message);
      throw new Error("Failed to save google oauth tokens");
    }

    return data;
  } catch (error) {
    console.error("Error saving google oauth tokens:", error.message);
    throw error;
  }
};

export {
  saveOTP,
  validateOTP,
  saveGoogleTokens,
  saveVerifiedPhoneNumber,
  checkVerifiedPhoneNumber,
};
