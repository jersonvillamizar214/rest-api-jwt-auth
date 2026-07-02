import { Router } from "express";
import * as usersController from "./users.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// All routes below require a valid access token.
router.use(authenticate);

router.get("/me", usersController.getMe);
router.get("/", authorize("ADMIN"), usersController.listUsers);

export default router;
