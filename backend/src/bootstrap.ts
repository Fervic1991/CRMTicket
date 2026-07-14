import dotenv from "dotenv";

dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env"
});

const appTimezone = process.env.APP_TIMEZONE || process.env.TZ || "Europe/Rome";

process.env.TZ = appTimezone;
process.env.APP_TIMEZONE = appTimezone;
