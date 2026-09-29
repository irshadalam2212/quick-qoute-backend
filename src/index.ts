import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import prisma from "./lib/prisma.js";

const PORT = process.env.PORT || 4321;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

const shutdown = async () => {
  console.log("Shutting down...");

  await prisma.$disconnect();

  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);