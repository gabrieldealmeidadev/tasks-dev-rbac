import { Router } from "express";
import { TaskController } from "../controllers/task-controller";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";
import { ensureRole } from "../middlewares/ensure-role";

const router = Router();
const taskController = new TaskController();

router.use(ensureAuthenticated);

// 👑
router.post("/", ensureRole(["ADMIN"]), taskController.create);

// 👥
router.get("/", ensureRole(["ADMIN", "USER"]), taskController.list);

// 👥
router.put("/:id", ensureRole(["ADMIN"]), taskController.update);

// 👑
router.delete("/:id", ensureRole(["ADMIN"]), taskController.delete);

export { router as taskRoutes };
