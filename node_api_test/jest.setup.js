import axios from "axios";

const baseUrl = process.env.API_BASE_URL || "http://localhost:8000";

// Create a custom axios instance with the base URL
const customAxios = axios.create({
  baseURL: baseUrl,
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  },
});

// Replace the global axios with our custom instance
global.axios = customAxios;
