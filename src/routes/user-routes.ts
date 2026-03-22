import { Router } from "express";
import { UserController } from "../controllers/user-controller";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";
import { ensureRole } from "../middlewares/ensure-role";

const router = Router();
const userController = new UserController();

router.use(ensureAuthenticated);

// ✅
router.get("/", ensureRole(["ADMIN", "USER"]), userController.list);

// ❌
router.post("/", ensureRole(["ADMIN"]), userController.create);

// ❌
router.put("/:id", ensureRole(["ADMIN"]), userController.update);

// ❌
router.delete("/:id", ensureRole(["ADMIN"]), userController.delete);

export { router as userRoutes };
