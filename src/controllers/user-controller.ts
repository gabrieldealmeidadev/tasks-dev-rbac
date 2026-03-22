import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { hash } from "bcrypt";

export class UserController {
  async create(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (name.trim().length < 3) {
        return res
          .status(400)
          .json({ message: "Name must be at least 3 characters long" });
      }

      const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long" });
      }

      const userExists = await prisma.user.findUnique({
        where: { email },
      });

      if (userExists) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const passwordHash = await hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: passwordHash,
        },
      });

      const { password: _, ...userWithoutPassword } = user;

      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!users || users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }

      return res.status(200).json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const { name, email, role } = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "User ID is required" });
      }

      const userExists = await prisma.user.findUnique({
        where: { id },
      });

      if (!userExists) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!name && !email && !role) {
        return res
          .status(400)
          .json({ message: "No fields provided for update" });
      }

      if (name !== undefined) {
        if (typeof name !== "string" || name.trim().length < 3) {
          return res
            .status(400)
            .json({ message: "Name must be at least 3 characters long" });
        }
      }

      if (email !== undefined) {
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (typeof email !== "string" || !emailRegex.test(email)) {
          return res.status(400).json({ message: "Invalid email format" });
        }

        const emailExists = await prisma.user.findFirst({
          where: {
            email: email.toLowerCase().trim(),
            NOT: { id },
          },
        });

        if (emailExists) {
          return res.status(409).json({ message: "Email already in use" });
        }
      }

      if (role !== undefined) {
        const validRoles = ["ADMIN", "USER"];
        if (!validRoles.includes(role)) {
          return res.status(400).json({
            message: `Invalid role. Allowed values: ${validRoles.join(", ")}`,
          });
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(name && { name: name.trim() }),
          ...(email && { email: email.toLowerCase().trim() }),
          ...(role && { role }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };

      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "User ID is required" });
      }

      const userExists = await prisma.user.findUnique({
        where: { id },
      });

      if (!userExists) {
        return res.status(404).json({ message: "User not found" });
      }

      await prisma.user.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
