import { Router } from "express";
import * as authController from "./auth.controller";
import { validateBody } from "../../middlewares/validate.middleware";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
} from "./auth.schema";

const router = Router();

router.post("/register", validateBody(registerSchema), authController.register);
router.post("/login", validateBody(loginSchema), authController.login);
router.post("/refresh", validateBody(refreshSchema), authController.refresh);
router.post("/logout", validateBody(refreshSchema), authController.logout);

export default router;
