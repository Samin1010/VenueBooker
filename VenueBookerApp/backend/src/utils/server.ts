import "reflect-metadata";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "../routes/auth.routes";
import venueRouter from "../routes/venue.routes";
import applicationRoutes from "../routes/application.routes";
import userRoutes from "../routes/user.routes";
import notificationRouter from "../routes/notification.routes";
import reportRouter from "../routes/report.routes";

const app = express();

app.locals.isReady = process.env.NODE_ENV === "test";

app.use(express.json({ limit: "4mb" }));

// it is added because 
// it taking like 15 minutes
// to rebuild and insert data in the
// database 
// i configured my render application
// under the health check section 
// as /health route in order to check the
// health of the application
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: app.locals.isReady ? "ready" : "rebuilding_database",
  });
});

// for cross origin resource sharing allowing different clients
// to access the api
app.use(cors());

// if the database
app.use("/api", (_req, res, next) => {
  if (!app.locals.isReady) {
    return res.status(503).json({
      message: "Database rebuild is still in progress",
    });
  }

  next();
});

// routes to different specific apis
app.use("/api/auth", authRouter);
app.use("/api/venue", venueRouter);
app.use("/api/application", applicationRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notification", notificationRouter);
app.use("/api/report", reportRouter);

export default app;
