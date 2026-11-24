import "dotenv/config";
import app from "./app.js";
import { PORT } from "./config/env.js";

const BASEPORT = PORT ? parseInt(PORT, 10) : 3000;

const server = app.listen(BASEPORT, () => {
  console.log(`🚀 Server listening at http://localhost:${BASEPORT}`);
  console.log(`🩺 Health check: http://localhost:${BASEPORT}/health`);
});

function shutdown(signal: string) {
  console.log(`\nReceived ${signal}. Closing server...`);
  server.close(() => {
    console.log("Server closed successfully.");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
