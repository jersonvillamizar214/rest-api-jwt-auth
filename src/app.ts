import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { landingPage } from "./landing";

export function createApp() {
  const app = express();

  // Secure headers, but allow the interactive landing page's own inline CSS/JS
  // and same-origin fetch calls to the API.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'"],
        },
      },
    })
  );
  app.use(cors());
  app.use(express.json());

  // Interactive playground — the API's public face.
  app.get("/", (_req, res) => res.type("html").send(landingPage()));

  // Liveness probe — used by Docker/K8s/CI health checks.
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);

  app.use(notFoundHandler); // 404 for unmatched routes
  app.use(errorHandler); // must be last

  return app;
}
