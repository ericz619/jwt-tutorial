const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(this.password, salt);
  // # replace our plain pwd with our hash pwd
  this.password = hash;
  return next();
});

userSchema.methods.comparePassword = async function (plain) {
  return await bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("user", userSchema);
