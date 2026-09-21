// Standalone Demo Mode is permanently active with 0 external backend dependency
export const IS_DEMO_MODE = true;

// Helper to get API URL based on environment
const getApiUrl = () => {
  return "/api/demo";
};

export const API_BASE_URL = getApiUrl();

// Export other env vars
export const ENV = {
  API_BASE_URL,
  IS_DEMO_MODE: true,
  IS_DEV: true,
  IS_PROD: false,
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
};


