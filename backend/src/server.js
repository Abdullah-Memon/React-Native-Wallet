import express from "express";
import dotenv, { parse } from "dotenv";
import { db, initDB } from "./config/db.js";
import rateLimitMiddleware from "./middleware/ratelimit.js";
import transactionRouter from "./route/transactionRouter.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// middle ware
app.use(express.json());
app.use(rateLimitMiddleware); // Apply the rate limit middleware to all routes

app.use("/api/transactions", transactionRouter);

initDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
