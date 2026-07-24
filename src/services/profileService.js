import API from "../utils/axios";

export const profileService = {
  // Get user profile
  getProfile: async () => {
    const response = await API.get("/users/profile");
    return response.data.data; // user object
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await API.put("/users/profile", data);
    return response.data.data; // updated user
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await API.put("/users/password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await API.post("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data; // updated user with avatar URL
  },
};