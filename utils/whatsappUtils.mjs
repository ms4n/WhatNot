import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const WHATSAPP_API_ACCESS_TOKEN = process.env.ACCESS_TOKEN;

export async function getMediaObjectFromId(mediaId) {
  const url = `https://graph.facebook.com/v19.0/${mediaId}/`;
  const headers = {
    Authorization: `Bearer ${WHATSAPP_API_ACCESS_TOKEN}`,
  };
  const res = await axios.get(url, { headers }).catch((error) => {
    console.error("Could not get media object:", error);
  });

  return res.data;
}
