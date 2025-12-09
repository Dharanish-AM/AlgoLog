const axios = require("axios");

// Global axios configuration for optimized performance
axios.defaults.timeout = 10000; // 10s default timeout
axios.defaults.maxRedirects = 5;
axios.defaults.decompress = true; // Enable automatic decompression

// Add request interceptor for compression headers
axios.interceptors.request.use(
  (config) => {
    // Add compression headers if not already present
    if (!config.headers["Accept-Encoding"]) {
      config.headers["Accept-Encoding"] = "gzip, deflate, br";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Enhanced error handling
    if (error.code === "ECONNABORTED") {
      error.message = "Request timeout - server took too long to respond";
    } else if (error.code === "ETIMEDOUT") {
      error.message = "Connection timeout - could not connect to server";
    } else if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      if (status === 429) {
        error.message = "Rate limited - too many requests";
      } else if (status === 503) {
        error.message = "Service unavailable - server is down";
      } else if (status === 404) {
        error.message = "Not found - resource does not exist";
      } else if (status >= 500) {
        error.message = `Server error (${status})`;
      }
    } else if (error.request) {
      // Request made but no response
      error.message = "No response from server - check network connection";
    }
    
    return Promise.reject(error);
  }
);

module.exports = axios;
