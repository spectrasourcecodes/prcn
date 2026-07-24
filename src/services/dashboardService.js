import API from "../utils/axios";

export const dashboardService = {
  // Get dashboard data from the correct endpoint
  getDashboard: async () => {
    const response = await API.get("/auth/dashboard");
    return response.data.data; // { wallet, transactions, investments }
  },

  // Get wallet separately (if needed)
  getWallet: async () => {
    const response = await API.get("/wallets/getwallet");
    return response.data.data;
  },

  getTransactions: async (page = 1, limit = 10) => {
    const response = await API.get("/wallet/transactions", {
      params: { page, limit },
    });
    return response.data;
  },
};