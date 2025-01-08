import { createClient } from "@supabase/supabase-js";
import { Request, Response } from "express";

// Add validation for required environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL environment variable is not set");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Express middleware to verify Supabase JWT
const authenticateUser = async (
  req: Request,
  res: Response,
  next: Function
) => {
  console.log("Authenticating user");
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).send({ error: "No token provided" });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error) throw error;
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export { authenticateUser };
