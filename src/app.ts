import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { router } from './routes';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: 'http://localhost:3001',
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(router);

export { app };
