import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import * as ngrok from "@ngrok/ngrok";

// Import routes
import birthInfoRouter from "./routes/birthInfo";
import dailyDashboardRouter from "./routes/dailyDashboard";
import scenariosRouter from "./routes/scenarios";
import friendsRouter from "./routes/friends";
import chatRouter from "./routes/chat";
// Import middleware
import { authenticateApiKey } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 3002;
const HOST = "0.0.0.0"; // Listen on all network interfaces

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: true,
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: "no-referrer" },
    xssFilter: true,
  })
);

const corsOptions: cors.CorsOptions = {
  origin: "*", // During development, allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-api-key", "Authorization"],
  exposedHeaders: ["Authorization"],
  maxAge: 86400,
  credentials: true,
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Health check route (no auth required)
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", environment: process.env.NODE_ENV });
});

// Apply authentication to other routes
app.use(authenticateApiKey);

// Routes
app.use("/api", birthInfoRouter);
app.use("/api", dailyDashboardRouter);
app.use("/api", scenariosRouter);
app.use("/api", friendsRouter);
app.use("/api", chatRouter);

// Test route
app.get("/test", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Test route working!" });
});

// Error handling
interface ErrorWithStack extends Error {
  stack?: string;
}

app.use(
  (err: ErrorWithStack, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    });
  }
);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Start ngrok if we're in development mode
  // if (process.env.NODE_ENV !== "production") {
  //   startNgrok();
  // }
});

// Function to start ngrok
async function startNgrok() {
  try {
    // Connect to ngrok
    const listener = await ngrok.connect({
      addr: PORT,
      authtoken_from_env: true, // Make sure NGROK_AUTHTOKEN is in your .env file
      // You can add more options here like domain, subdomain, etc.
    });

    console.log(`✨ Ngrok tunnel established at: ${listener.url()}`);
    console.log(`Use this URL in your React Native app's API client`);
  } catch (error) {
    console.error("Failed to start ngrok:", error);
    console.log(
      "You can still access the API locally at http://localhost:" + PORT
    );
  }
}

export default app;
