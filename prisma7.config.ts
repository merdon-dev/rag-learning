import { config } from "dotenv";
import path from "node:path";
import { defineConfig } from "prisma/config";

config({
  path: path.resolve(
    process.cwd(),
    `src/config/env/.env.${process.env.NODE_ENV || "development"}`,
  ),
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
