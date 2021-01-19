const jwt = require("jsonwebtoken");

const { User, Token } = require("../models");
const { refreshKey, secretKey } = require("../config");

module.exports = {
  createAccessToken: (payload) => {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, secretKey, { expiresIn: "30s" }, (err, token) => {
        if (err) return reject(err);
        return resolve(token);
      });
    });
  },
  createRefreshToken: (payload) => {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        refreshKey,
        { expiresIn: "7d" },
        async (err, decoded_token) => {
          if (err) return reject(err);

          // # check if a user already have a token
          const token = await Token.findOne({ user: payload.id });

          // # check if no refresh
          if (!token) {
            // # create a new  refresh token
            await Token.create({
              refreshToken: decoded_token,
              user: payload.id,
            });
          } else {
            token.refreshToken = decoded_token;
            await token.save();
          }

          // # return our new refresh token
          return resolve(decoded_token);
        }
      );
    });
  },
  verifyAccessToken: (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) throw new Error("No Auth Token Provided!");
    // # verify the token
    jwt.verify(authorization, secretKey, (err, decoded) => {
      if (err) return next(err);
      return next();
    });
  },
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      jwt.verify(refreshToken, refreshKey, (err, decoded) => {
        if (err) return reject("Invalid refresh token!");
        return resolve(decoded);
      });
    });
  },
};
