// db.mjs

// Database functions for managing OTP, user data, and Google OAuth tokens

import { supabase } from "./supabase.mjs";
import { encryptToken, decryptToken } from "../app/utils/tokenUtils.mjs";
import oauth2Client from "../config/googleOauthConfig.mjs";

// Save OTP (One-Time Password) for a given phone number with expiration time
// Parameters:
// - phoneNumber: Phone number for which OTP is being saved
// - otp: OTP code to be saved
// - otpExpirationTime: Expiration time for the OTP

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
      console.error("Error saving OTP:", error);
      throw new Error("Failed to save OTP");
    }

    return data;
  } catch (error) {
    console.error("Error saving OTP:", error.message);
    throw error;
  }
};

// Validate OTP (One-Time Password) for a given phone number
// Parameters:
// - phoneNumber: Phone number for which OTP is being validated
// - userOTP: OTP code entered by the user
// Returns: Boolean indicating whether the OTP is valid
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

// Save otp verified phone number to the database
// Parameters:
// - phoneNumber: Phone number to be saved as verified
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

// Check if a phone number is verified
// Parameters:
// - phoneNumber: Phone number to check for verification
// Returns: Boolean indicating whether the phone number is verified
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

// Save Encrypted Google OAuth tokens to the database
// Parameters:
// - phoneNumber: Phone number associated with the tokens
// - tokens: Google OAuth tokens to be saved
const saveGoogleTokens = async (phoneNumber, tokens) => {
  try {
    const encryptedRefreshToken = tokens.refresh_token
      ? encryptToken(tokens.refresh_token)
      : null;

    const upsertData = {
      phone_number: phoneNumber,
      google_access_token_expiry_date: tokens.expiry_date,

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

// Renew Google Access Token for a given phone number
// Parameters:
// - phoneNumber: Phone number associated with the access token
// Returns: New Google Access Token
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
    console.error("Error renewing Google Access tokens:", error.data);
    throw error;
  }
};

const saveReminder = async (phoneNumber, reminderTime, reminderText) => {
  try {
    const { data, error } = await supabase.from("REMINDERS").insert([
      {
        phone_number: phoneNumber,
        reminder_time: reminderTime,
        reminder_text: reminderText,
      },
    ]);

    if (error) {
      console.error("Error saving reminder:", error);
      throw new Error("Failed to save reminder!");
    }
    return { statusCode: 200, data: data };
  } catch (error) {
    console.error("Error saving reminder:", error.message);
    throw error;
  }
};

const fetchReminders = async (currentTime, reminderCheckTime) => {
  try {
    const { data, error } = await supabase
      .from("REMINDERS")
      .select("*")
      .eq("status", "pending")
      .gte("reminder_time", currentTime)
      .lte("reminder_time", reminderCheckTime);

    if (error) {
      throw new Error("Failed to fetch reminders: " + error.message);
    }

    if (!data) {
      throw new Error("No reminders found!");
    }

    return data;
  } catch (error) {
    console.error("Error fetching reminders:", error.message);
    throw error;
  }
};

const updateReminderStatus = async (reminderId, statusMessage) => {
  try {
    const { error } = await supabase
      .from("REMINDERS")
      .update({ status: statusMessage })
      .eq("id", reminderId);

    if (error) {
      throw new Error("Failed to update reminder status: " + error.message);
    }
  } catch (error) {
    console.error("Error updating reminder status:", error.message);
    throw error;
  }
};

export {
  saveOTP,
  validateOTP,
  saveGoogleTokens,
  saveVerifiedPhoneNumber,
  checkVerifiedPhoneNumber,
  renewGoogleAccessToken,
  saveReminder,
  fetchReminders,
  updateReminderStatus,
};

//TODO: implementing caching for access tokens
