import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { DATABASE_URL } from "./env.js";

const connectionString = DATABASE_URL;
console.log({
  databaseUrlExists: Boolean(DATABASE_URL),
});
if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });
