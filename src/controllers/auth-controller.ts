import { Request, Response } from 'express';
import { prisma } from '../database/prisma';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { authConfig } from '../config/auth';

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = sign({ role: user.role }, authConfig.jwt.secret, {
      subject: user.id,
      expiresIn: authConfig.jwt.expiresIn,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // true em produção
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }
}
