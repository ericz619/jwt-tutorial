const express = require("express");

const { port } = require("./config");
const { User, Token } = require("./models");
const {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require("./helpers/auth");

// # init our mongodb instance
require("./helpers/init-mongo");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// # Test Route
app.get("/test", (req, res) => {
  res.end("ok");
});

// # Register Route
app.post("/register", async (req, res, next) => {
  try {
    // # Find the user
    const user = await User.findOne({ email: req.body.email });
    // # If user already exist
    if (user) throw new Error("User already existed!");
    // # Create new user
    await User.create({ ...req.body });
    // # return back user response
    return res.status(200).json({
      status: 200,
      message: "Successfully created new account!",
    });
  } catch (e) {
    if (e) {
      return next(e);
    }
  }
});

// # Login Route
app.post("/login", async (req, res, next) => {
  try {
    // # find a user
    const user = await User.findOne({ email: req.body.email });
    // # if no user or invalid password
    if (!user || !(await user.comparePassword(req.body.password)))
      throw new Error("Invalid email or password, please try again!");

    const payload = { id: user.id };
    // # create our new access token
    const accessToken = await createAccessToken(payload);
    // # create our refresh token
    const refreshToken = await createRefreshToken(payload);
    // # return our access_token and refresh_token
    return res.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (e) {
    if (e) {
      return next(e);
    }
  }
});

// # Logout Route
app.post("/logout", async (req, res, next) => {
  try {
    // # validate our refresh token
    await verifyRefreshToken(req.body.refreshToken);
    // # delete our refresh token
    await Token.deleteOne({ refreshToken: req.body.refreshToken });
    // # return our status back of 204
    return res.sendStatus(204);
  } catch (e) {
    if (e) {
      return next(e);
    }
  }
});

// # Refresh Route
app.post("/refresh", async (req, res, next) => {
  try {
    // # valdiate our refresh token
    const { id } = await verifyRefreshToken(req.body.refreshToken);
    // # create a new access_token
    const accessToken = await createAccessToken({ id });
    // # return our accessToken
    return res.status(200).json({
      accessToken,
    });
  } catch (e) {
    if (e) {
      return next(e);
    }
  }
});

// # Protected Route
app.get("/protected", verifyAccessToken, (req, res, next) => {
  return res.status(200).json({
    success: true,
  });
});

// # Error handler
app.use((err, req, res, next) => {
  if (err) {
    const status = err.status || 500;
    return res.status(status).json({
      status: err.status,
      request_url: req.originalUrl,
      error: err.toString(),
    });
  }
});

// # listen to our server
app.listen(port, () => console.log(`Server is listening on port ${port}`));
