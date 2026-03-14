import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import db from "./config/db.js";

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await db.query("SELECT 1");
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/api/health`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error(
      "---------------\nDatabase connection failed:",
      error.message
    );
    process.exit(1);
  }
};

startServer();
