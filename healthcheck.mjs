// Simple health check script
import { request } from "http";

import dotenv from "dotenv";
dotenv.config();

const options = {
  hostname: "localhost",
  port: process.env.PORT,
  path: "/",
  method: "GET",
};

const req = request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on("error", (err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});

req.end();
