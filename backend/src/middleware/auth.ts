const authenticateApiKey = (req: any, res: any, next: Function) => {
  const apiKey = req.headers["x-api-key"] || req.query.apiKey;

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

export { authenticateApiKey };
