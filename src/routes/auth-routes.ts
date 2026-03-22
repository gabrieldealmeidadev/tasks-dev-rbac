import { Router } from "express";
import { AuthController } from "../controllers/auth-controller";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";
import { prisma } from "../database/prisma";

const router = Router();
const authController = new AuthController();

router.post("/login", authController.login);

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // true em produção
  });

  return res.json({ message: "Logged out" });
});

router.get("/me", ensureAuthenticated, async (req, res) => {
  const userId = req.user.sub;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return res.json(user);
});

export { router as authRoutes };
