import API from "../utils/axios";

export const adminWalletService = {
  // Get all active payment methods (for users)
  getWallets: async () => {
    try {
      const response = await API.get("/users/wallets");
      return response.data.data;
    } catch (error) {
      console.error('Error fetching wallets:', error.message);
      // Re-throw so the component can handle it
      throw error;
    }
  },

  getWalletsByType: async (type) => {
    try {
      const response = await API.get("/users/wallets", { params: { type } });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching wallets by type:', error.message);
      throw error;
    }
  },
};