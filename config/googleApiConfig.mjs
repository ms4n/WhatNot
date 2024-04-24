import { google } from "googleapis";
import { fetchGoogleAccessToken } from "../database/db.mjs";
// Function to initialize the OAuth2 client with the access token
const initializeAuth = async (phoneNumber) => {
  const accessToken = await fetchGoogleAccessToken(phoneNumber);

  // Initialize OAuth2 client with the retrieved access token
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  return auth;
};

// Function to get the Google Drive service
const getDriveService = async (phoneNumber) => {
  const auth = await initializeAuth(phoneNumber);
  return google.drive({ version: "v3", auth });
};

// Function to get the Google Docs service
const getDocsService = async (phoneNumber) => {
  const auth = await initializeAuth(phoneNumber);
  return google.docs({ version: "v1", auth });
};

// Function to get the Google Calendar service
const getCalendarService = async (phoneNumber) => {
  const auth = await initializeAuth(phoneNumber);
  return google.calendar({ version: "v3", auth });
};

export { getDriveService, getDocsService, getCalendarService };
