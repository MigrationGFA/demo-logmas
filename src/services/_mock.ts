// Mock-mode switch. When VITE_API_BASE_URL is unset and VITE_USE_MOCK !== "false",
// services delegate to the in-memory store so the demo keeps working without a backend.
// When the real Node/Express/Prisma backend is online, set VITE_USE_MOCK=false (or VITE_API_BASE_URL)
// and the services will hit `/api/v1/...` via axios.
const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
const useMockFlag = env.VITE_USE_MOCK;
const apiBase = env.VITE_API_BASE_URL;

export const MOCK_MODE: boolean =
  false;

// Tiny artificial latency so the UI exercises loading states like a real network.
export const tick = <T>(value: T, ms = 80): Promise<T> =>
  new Promise((res) => setTimeout(() => res(value), ms));



export const getTestData = () => {
  const testApplications = [
    {
      fullName: "John O. Testerson",
      dateOfBirth: "1990-05-15",
      address: "123 Test Street, Ikeja, Lagos",
      phone: "08012345678",
      email: "john.testerson@example.com",
      wardId: "8e56bdaf-2de8-4108-a6d5-96c78537f55c", // Atan I
      purpose: "Employment",
      nin: "12345678901",
    },
    {
      fullName: "Jane A. Smith",
      dateOfBirth: "1985-08-22",
      address: "456 Demo Avenue, Victoria Island, Lagos",
      phone: "08098765432",
      email: "jane.smith@example.com",
      wardId: "0c34587b-fd59-426b-a89f-468c24fa90d3", // Erunwon
      purpose: "School Admission",
      nin: "98765432109",
    },
    {
      fullName: "Michael K. Johnson",
      dateOfBirth: "1995-12-10",
      address: "789 Sample Road, Surulere, Lagos",
      phone: "08123456789",
      email: "michael.johnson@example.com",
      wardId: "8e56bdaf-2de8-4108-a6d5-96c78537f55c", // Atan I
      purpose: "Marriage Certificate",
      nin: "55566677788",
    },
  ];

  // Randomly pick one for testing
  return testApplications[Math.floor(Math.random() * testApplications.length)];
};
