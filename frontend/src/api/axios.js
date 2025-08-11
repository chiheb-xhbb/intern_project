import axios from "axios";

/**
 * Axios instance configuration for API calls
 * This instance is pre-configured with common settings and base URL
 */
const instance = axios.create({
  // Base URL for all API endpoints - adjust if your backend runs elsewhere
  baseURL: "http://127.0.0.1:8000/api",
  
  // Default headers for all requests
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  
  // Request timeout (optional - uncomment if needed)
  // timeout: 10000,
});

export default instance;
