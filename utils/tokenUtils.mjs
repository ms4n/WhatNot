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

// Example usage
// const accessToken = "your_token";
// const refreshToken = "your_refresh_token";
// const secretKey = Buffer.from(
//   "c2948a2c907be1d99c5eb889917d37556c6a97660732497e97c22a8b6ace26b7",
//   "hex"
// ); // Make sure to keep this secure

// // Encrypt tokens before saving to the database
// const encryptedAccessToken = encryptToken(accessToken, secretKey);
// const encryptedRefreshToken = encryptToken(refreshToken, secretKey);

// console.log("Encrypted Access Token:", encryptedAccessToken);
// console.log("Encrypted Refresh Token:", encryptedRefreshToken);

// // Decrypt tokens when needed
// const decryptedAccessToken = decryptToken(
//   encryptedAccessToken.encryptedData,
//   encryptedAccessToken.iv,
//   secretKey
// );
// const decryptedRefreshToken = decryptToken(
//   encryptedRefreshToken.encryptedData,
//   encryptedRefreshToken.iv,
//   secretKey
// );

// console.log("Decrypted Access Token:", decryptedAccessToken);
// console.log("Decrypted Refresh Token:", decryptedRefreshToken);

export { encryptToken, decryptToken };
