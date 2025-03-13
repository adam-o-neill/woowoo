const authenticateApiKey = (req: any, res: any, next: Function) => {
  console.log("Auth middleware called");
  console.log("req body", req.body);
  const apiKey = req.headers["x-api-key"] || req.query.apiKey;

  // Skip authentication in development mode if API_KEY is not set
  if (process.env.NODE_ENV === "development") {
    console.log("Development mode: Skipping API key validation");
    return next();
  }

  if (!apiKey || apiKey !== process.env.API_KEY) {
    console.log("API key missing or invalid:", apiKey);
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log("Authentication successful");
  next();
};

export { authenticateApiKey };
