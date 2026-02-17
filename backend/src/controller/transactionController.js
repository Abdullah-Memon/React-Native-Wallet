import { db } from "../config/db.js";

export async function getTransactionsByUserId(req, res) {
  const user_id = req.params.userId;

  if (isNaN(parseInt(user_id))) {
    return res.status(400).json({ error: "Invalid User ID" });
  }

  try {
    const transactions = await db`
        SELECT * 
        FROM transactions 
        WHERE user_id = ${user_id}
        ORDER BY created_at DESC;
        `;
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function createTransaction(req, res) {
  const { user_id, title, amount, category } = req.body;
  try {
    // validate the input
    if (!user_id || !title || amount === undefined || !category) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const transaction = await db`
            INSERT INTO transactions (user_id, title, amount, category) 
            VALUES (${user_id}, ${title}, ${amount}, ${category})
            RETURNING *;
            `;

    res.status(201).json(transaction[0]);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function deleteTransaction(req, res) {
  const id = req.params.id;

  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: "Invalid Transaction ID" });
  }

  try {
    const deletedTransaction = await db`
          DELETE FROM transactions
          WHERE id = ${id}
          RETURNING *;
        `;

    if (deletedTransaction.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getTransactionSummary(req, res) {
  const user_id = req.params.userId;
  if (isNaN(parseInt(user_id))) {
    return res.status(400).json({ error: "Invalid User ID" });
  }

  try {
    const summary = await db`
      SELECT 
       COALESCE(SUM(amount), 0) AS balance,
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END), 0) AS total_expense
      FROM transactions
      WHERE user_id = ${user_id};
    `;

    res.status(200).json(summary[0]);
  } catch (error) {
    console.error("Error fetching transaction summary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
