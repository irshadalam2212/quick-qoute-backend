import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import itemRouter from "./routes/item.routes.js";
import quotationRouter from "./routes/quotation.routes.js";
import invoiceRouter from "./routes/invoice.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import unitRouter from "./routes/unit.routes.js";
import aiRouter from "./routes/ai.routes.js";
import categoryRouter from "./routes/category.routes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";

const app: Express = express();

// Apply CORS first so clients can read errors from request middleware.
const allowedOrigins = [
  "http://localhost:4000",
  "https://quickqoute.netlify.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Shared request middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Public routes
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/uom", unitRouter);
app.use("/api/v1/categories", categoryRouter);

// Authenticated routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/items", itemRouter);
app.use("/api/v1/quotations", quotationRouter);
app.use("/api/v1/invoices", invoiceRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// AI routes
app.use("/api/v1/ai", aiRouter);

// Error handling must be registered after all routes
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
