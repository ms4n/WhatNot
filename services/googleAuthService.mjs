import oauth2Client from "../config/googleOauthConfig.mjs";

const scopes = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/calendar.events",
];

export function generateAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
}

export async function getAuthTokens(authorizationCode) {
  const { tokens } = await oauth2Client.getToken(authorizationCode);
  return tokens;
}
