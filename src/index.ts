// Must be the first import so env vars are loaded before any config module reads them.
import "dotenv/config";

import app from "./app.js";
import prisma from "./lib/prisma.js";
import { env } from "./config/env.js";

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

const shutdown = async (): Promise<void> => {
  console.log("Shutting down...");

  await prisma.$disconnect();

  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
