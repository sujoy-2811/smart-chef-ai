import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const poll = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runMigrations() {
  const client = await poll.connect();
  try {
    console.log("Running migrations...");

    // READ the SCHEMA FILE
    const schemaPath = path.join(__dirname, "config", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    // EXECUTE the SCHEMA
    await client.query(schema);
    console.log("Database schema created successfully.");
    console.log("Migrations completed successfully.");
  } catch (err) {
    console.error("Error running migrations:", err);
  } finally {
    client.release();
  }
}

runMigrations();
