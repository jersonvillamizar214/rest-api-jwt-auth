import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

export function createApp() {
  const app = express();

  app.use(helmet()); // secure HTTP headers
  app.use(cors());
  app.use(express.json());

  // Liveness probe — used by Docker/K8s/CI health checks.
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);

  app.use(notFoundHandler); // 404 for unmatched routes
  app.use(errorHandler); // must be last

  return app;
}
