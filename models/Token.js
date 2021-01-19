const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  refreshToken: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("token", tokenSchema);
