import { google } from "googleapis";

import dotenv from "dotenv";
dotenv.config();

const accessToken = process.env.ACCESS_TOKEN; //ACCESS_TOKEN is of whatsapp api, need to change this
const auth = new google.auth.OAuth2();
auth.setCredentials({ access_token: accessToken });

const driveService = google.drive({ version: "v3", auth });

export default driveService;
