import express from 'express';
import cookieParser from 'cookie-parser';
import { router } from './routes/index.js';
import { config } from '#config';
import { cors } from './middlewares/cors.js';
import { logger } from './middlewares/logger.js';
import { errorHandler } from './middlewares/error-handler.js';
import { connectDB } from './db/prisma.js';

const app = express();

await connectDB();

app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);

// 도메인 라우트 하위 그룹
app.use('/api', router);

// 에러 핸들러는 반드시 마지막에 등록
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(
    `[${config.NODE_ENV}] Server running at http://localhost:${config.PORT}`,
  );
});