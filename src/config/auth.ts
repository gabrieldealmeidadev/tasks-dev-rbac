import dotenv from 'dotenv';
dotenv.config();

export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: '1d' as const,
  },
};
