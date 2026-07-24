import API from "../utils/axios";

export const marketService = {
  // Get market prices for all coins
  getMarketPrices: async (ids = null) => {
    const params = ids ? { ids } : {};
    const response = await API.get("/market/prices", { params });
    return response.data.data;
  },

  // Get trending coins
  getTrending: async () => {
    const response = await API.get("/market/trending");
    return response.data.data;
  },

  // Get top gainers
  getGainers: async () => {
    const response = await API.get("/market/gainers");
    return response.data.data;
  },

  // Get top losers
  getLosers: async () => {
    const response = await API.get("/market/losers");
    return response.data.data;
  },

  // Get exchange rates
  getExchangeRates: async () => {
    const response = await API.get("/market/rates");
    return response.data.data;
  },
};