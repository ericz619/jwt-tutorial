const mongoose = require("mongoose");
const { mongoUri } = require("../config");

(async () => {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });

    console.log("connected to mongodb!");
  } catch (e) {
    if (e) throw new Error(e);
  }
})();
