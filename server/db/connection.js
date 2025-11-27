const mongoose = require("mongoose");

let connectionPromise = null;

async function connectToDatabase() {
  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in the environment");
  }

  mongoose.set("strictQuery", true);

  connectionPromise = mongoose
    .connect(uri)
    .then((conn) => {
      return conn;
    })
    .catch((err) => {
      connectionPromise = null;
      throw err;
    });

  return connectionPromise;
}

module.exports = { connectToDatabase };
