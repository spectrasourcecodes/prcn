import API from "../utils/axios";

export const investmentService = {
  // Get all investment plans
  getPlans: async () => {
    const response = await API.get("/investments/plans");
    return response.data.data;
  },

  // Create an investment (pending payment)
  createInvestment: async (data) => {
    const response = await API.post("/investments", data);
    return response.data.data; // { investment, reference, wallet }
  },

  // Upload proof of payment for investment
  uploadProof: async (investmentId, proofImage) => {
    // Convert file to base64
    const reader = new FileReader();
    const base64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(proofImage);
    });

    const response = await API.post(`/investments/${investmentId}/upload-proof`, {
        proofImage: base64,
    });
    return response.data.data;
  },
};