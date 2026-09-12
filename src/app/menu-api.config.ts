// Development-only endpoint. Do not put long-lived secrets in browser code in production.
export const API_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0YWJsZSI6InRhYmxlMSJ9.8pKKHsktqPfb9sOU1rO1YJksFpSN5w9_9sRGsAq3028';
export const MENU_API_URL = `/api/scan?token=${API_TOKEN}`;
export const ORDER_API_URL = '/api/order';
