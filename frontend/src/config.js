const CONFIG = {
  BASE_URL:
    process.env.NODE_ENV === "production"
      ? "https://cutwaterz-production.up.railway.app"
      : "http://localhost:4000",
};

export default CONFIG;
