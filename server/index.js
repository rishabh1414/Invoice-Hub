/* eslint-disable no-console */
const express = require("express");
const next = require("next");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { connectToDatabase } = require("./db/connection");
const apiRouter = require("./routes");

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const port = process.env.PORT || 3000;

async function start() {
  try {
    await nextApp.prepare();
    await connectToDatabase();

    const server = express();
    server.use(express.json({ limit: "2mb" }));
    server.use(cookieParser());

    // API routes
    server.use("/api", apiRouter);

    // Next.js handler
    server.all("*", (req, res) => handle(req, res));

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();
