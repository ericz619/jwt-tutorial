const dotenv = require("dotenv");

if (!dotenv.config()) throw new Error("No .env file!");

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  secretKey: process.env.SECRET_KEY,
  refreshKey: process.env.REFRESH_KEY,
};

module.exports = config;
