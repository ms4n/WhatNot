import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Function to generate a secure secret key
function generateSecretKey() {
  return randomBytes(32).toString("hex"); // 32 bytes for AES-256
}

// Example usage
// const secretKey = generateSecretKey();
// console.log("Generated Secret Key:", secretKey);

function encryptToken(
  token,
  secretKey = Buffer.from(process.env.AES_SECRET_KEY, "hex")
) {
  const iv = randomBytes(16); // Generate a random IV
  const cipher = createCipheriv("aes-256-cbc", secretKey, iv);
  let encrypted = cipher.update(token);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted.toString("hex"),
  };
}

// Function to decrypt the access token
function decryptToken(
  encryptedData,
  iv,
  secretKey = Buffer.from(process.env.AES_SECRET_KEY, "hex")
) {
  const decipher = createDecipheriv(
    "aes-256-cbc",
    secretKey,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(Buffer.from(encryptedData, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export { encryptToken, decryptToken };
