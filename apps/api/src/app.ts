import 'express-async-errors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import env from '@config/env';
import swaggerSpec from '@config/swagger';
import errorHandler from '@middleware/errorHandler';
import apiRateLimiter from '@middleware/rateLimiter';
import routes from '@routes/index';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin === '*' ? true : env.clientOrigin,
    credentials: true
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined'));
app.use(apiRateLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.json({
    name: 'EduBloom API',
    documentation: '/api/v1/docs'
  });
});

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1', routes);

app.use(errorHandler);

export default app;
