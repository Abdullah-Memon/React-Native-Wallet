import {  useCallback, useState } from "react";
import {Alert} from "react-native";


const API_URL = "http://localhost:5001/api/transactions";

export const useTransactions = (user_id) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ balance: 0, income: 0, expense: 0 });
  const [loading, setLoading] = useState(true);

  // Use useCallback to memoize the fetchTransactions function, so it only changes if user_id changes (performance optimization)
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/${user_id}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, [user_id]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/${user_id}/summary`);
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  }, [user_id]);


  // Load both transactions and summary at the same time
  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([fetchTransactions(), fetchSummary()])
      .catch((error) => console.error("Error loading data:", error))
      .finally(() => setLoading(false));
  }, [fetchTransactions, fetchSummary]);

  // Delete a transaction by ID and refresh the data
    const deleteTransaction = useCallback(async (transactionId) => {
    try {      const response = await fetch(`${API_URL}/${transactionId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }
      Alert.alert("Success", "Transaction deleted successfully");
      loadData(); // Refresh data after deletion
    } catch (error) {
        Alert.alert("Error", "Failed to delete transaction");
      console.error("Error deleting transaction:", error);
    }
  }, [ loadData]);

  return { transactions, summary, loading, loadData, deleteTransaction };
};
