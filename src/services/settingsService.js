import API from "../utils/axios";

export const settingsService = {
  // Get settings
  getSettings: async () => {
    const response = await API.get("/users/settings");
    return response.data.data;
  },

  // Update settings
  updateSettings: async (settings) => {
    const response = await API.put("/users/settings", settings);
    return response.data.data;
  },

  // Toggle 2FA
  toggleTwoFactor: async (enabled) => {
    const response = await API.post("/users/2fa", { enabled });
    return response.data.data;
  },
};