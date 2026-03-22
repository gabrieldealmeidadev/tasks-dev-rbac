import { Request, Response } from "express";
import { prisma } from "../database/prisma";

export class TaskController {
  async create(req: Request, res: Response) {
    try {
      const { title, description, userId, priority, dueDate } = req.body;

      if (!title || !userId || !priority) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        return res.status(404).json({ message: "User not found" });
      }

      const task = await prisma.task.create({
        data: {
          title,
          description,
          userId,
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      });

      return res.status(201).json(task);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const user = req.user;
      let tasks;

      if (user.role === "ADMIN") {
        tasks = await prisma.task.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      } else {
        tasks = await prisma.task.findMany({
          where: { userId: user.sub },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      }

      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const { title, description, priority, dueDate, status } = req.body;

      const user = req.user;

      const task = await prisma.task.findUnique({
        where: { id },
      });

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (user.role !== "ADMIN" && task.userId !== user.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updated = await prisma.task.update({
        where: { id },
        data: {
          title,
          description,
          priority,
          status,
          dueDate: dueDate ? new Date(dueDate) : undefined,
        },
      });

      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };

      const task = await prisma.task.findUnique({
        where: { id },
      });

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const deleteTaks = await prisma.task.delete({
        where: { id },
      });

      return res.status(204).json(deleteTaks);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
}
