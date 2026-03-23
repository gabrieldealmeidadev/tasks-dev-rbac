import { Router } from 'express';
import { UserController } from '../controllers/user-controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated';
import { ensureRole } from '../middlewares/ensure-role';

const router = Router();
const userController = new UserController();

// 🔒 autenticado (admin e user)
router.get(
  '/',
  ensureAuthenticated,
  ensureRole(['ADMIN', 'USER']),
  userController.list
);

// 🔓 pública (registro)
router.post('/', userController.create);

// 🔒 só admin
router.put(
  '/:id',
  ensureAuthenticated,
  ensureRole(['ADMIN']),
  userController.update
);

router.delete(
  '/:id',
  ensureAuthenticated,
  ensureRole(['ADMIN']),
  userController.delete
);

export { router as userRoutes };
