import API from "../utils/axios";

export const walletService = {
  // Get wallet balance
  getWallet: async () => {
    const response = await API.get("/wallet");
    return response.data.data;
  },

  // Get transactions
  getTransactions: async (page = 1, limit = 20) => {
    const response = await API.get("/wallet/transactions", {
      params: { page, limit },
    });
    return response.data; // { data, pagination }
  },

  // Create deposit request
  createDeposit: async (data) => {
    const response = await API.post("/deposits", data);
    return response.data.data;
  },

  // Request withdrawal
  requestWithdrawal: async (data) => {
    const response = await API.post("/withdrawals", data);
    return response.data.data;
  },
};