import { supabase } from "./supabase.mjs";
import { encryptToken, decryptToken } from "../utils/tokenUtils.mjs";
import oauth2Client from "../config/googleOauthConfig.mjs";

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
    const encryptedAccessToken = tokens.access_token
      ? encryptToken(tokens.access_token)
      : null;
    const encryptedRefreshToken = tokens.refresh_token
      ? encryptToken(tokens.refresh_token)
      : null;

    const upsertData = {
      phone_number: phoneNumber,
      google_access_token_expiry_date: tokens.expiry_date,

      ...(encryptedAccessToken && {
        google_access_token_encrypted: encryptedAccessToken.encryptedData,
        google_access_token_iv: encryptedAccessToken.iv,
      }),

      ...(encryptedRefreshToken && {
        google_refresh_token_encrypted: encryptedRefreshToken.encryptedData,
        google_refresh_token_iv: encryptedRefreshToken.iv,
      }),
    };

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

const fetchGoogleAccessToken = async (phoneNumber) => {
  try {
    const { data, error } = await supabase
      .from("USER")
      .select(
        "google_access_token_expiry_date, google_access_token_encrypted, google_access_token_iv"
      )
      .eq("phone_number", phoneNumber)
      .single();

    if (error) {
      throw new Error("Failed to fetch Google Access token: " + error.message);
    }

    if (!data) {
      throw new Error("Access token data not found");
    }

    if (data.google_access_token_expiry_date > Date.now()) {
      const decryptedAccessToken = decryptToken(
        data.google_access_token_encrypted,
        data.google_access_token_iv
      );
      return decryptedAccessToken;
    } else {
      return renewGoogleAccessToken(phoneNumber);
    }
  } catch (error) {
    console.error("Error fetching Google Access token:", error.message);
    throw error;
  }
};

const renewGoogleAccessToken = async (phoneNumber) => {
  try {
    const { data, error } = await supabase
      .from("USER")
      .select("google_refresh_token_encrypted, google_refresh_token_iv")
      .eq("phone_number", phoneNumber)
      .single();

    if (error) {
      throw new Error("Failed to fetch Google Refresh token: " + error.message);
    }

    if (!data) {
      throw new Error("Refresh token data not found");
    }

    const decryptedRefreshToken = decryptToken(
      data.google_refresh_token_encrypted,
      data.google_refresh_token_iv
    );

    oauth2Client.setCredentials({ refresh_token: decryptedRefreshToken });

    const { tokens, error: refreshError } = await new Promise((resolve) => {
      oauth2Client.refreshAccessToken((err, tokens) => {
        if (err) {
          console.error("Error refreshing access token:", err);
          resolve({ error: err });
        } else {
          resolve({ tokens });
        }
      });
    });

    if (refreshError) {
      throw new Error("Error refreshing access token: " + refreshError.message);
    }

    await saveGoogleTokens(phoneNumber, tokens);

    return tokens.access_token;
  } catch (error) {
    console.error("Error renewing Google Access tokens:", error.message);
    throw error;
  }
};

export {
  saveOTP,
  validateOTP,
  saveGoogleTokens,
  saveVerifiedPhoneNumber,
  checkVerifiedPhoneNumber,
  fetchGoogleAccessToken,
  renewGoogleAccessToken,
};
