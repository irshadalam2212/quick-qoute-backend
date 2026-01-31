import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

//basic configurations
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//cors configurations
// const allowedOrigins = process.env.CORS_ORIGIN
//   ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
//   : ["http://localhost:4000", "https://quickqoute.netlify.app"];

app.use(
  cors({
    origin: [
      "http://localhost:4000",
      "https://quickqoute.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//import the routes
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import itemRouter from "./routes/item.routes.js";
import quotationRouter from "./routes/quotation.routes.js";
import invoiceRouter from "./routes/invoice.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/items", itemRouter);
app.use("/api/v1/quotations", quotationRouter);
app.use("/api/v1/invoices", invoiceRouter);
app.use("/api/v1/dashboard", dashboardRouter);

export default app;
