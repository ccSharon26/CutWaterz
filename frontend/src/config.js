const dev = "http://localhost:4000/api";
const prod = "https://cutwaterz-production.up.railway.app/api";

export const API_BASE = process.env.NODE_ENV === "production" ? prod : dev;
