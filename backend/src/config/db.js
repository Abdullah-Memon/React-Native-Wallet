import {neon} from '@neondatabase/serverless';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

// Create a Neon client instance (database connection)
export const db = neon(connectionString);

export async function initDB() {
  try {
    await db` CREATE TABLE IF NOT EXISTS transactions(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    created_at DATE DEFAULT CURRENT_DATE
    );`;

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1); // Exit the process with an error code: status 1 = failure and 0 = success
  }
}