// Helper to get API URL based on environment
const getApiUrl = () => {
  // In demo mode or when unset, default to demo API base
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
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
