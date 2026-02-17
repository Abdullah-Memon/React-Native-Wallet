import express from "express";
import { createTransaction, deleteTransaction, getTransactionsByUserId, getTransactionSummary } from "../controller/transactionController.js";

const transactionRouter = express.Router();

transactionRouter.get("/:userId", getTransactionsByUserId);

transactionRouter.post("/", createTransaction);

transactionRouter.delete("/:id", deleteTransaction);

transactionRouter.get("/summary/:userId", getTransactionSummary);

export default transactionRouter;
