import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

dotenv.config();

import { config } from './config/index.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';
import { swaggerSpec } from './docs/swagger.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.cors.origin }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (config.isDevelopment) {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.isDevelopment ? 1000 : 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
if (!config.isDevelopment) {
  app.use('/api/', limiter);
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'POS System API Documentation',
}));

app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'POS System API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

app.use('/api/v1', routes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    logger.info(`API Documentation: http://localhost:${config.port}/api-docs`);
    logger.info(`Health Check: http://localhost:${config.port}/health`);
  });
}

export default app;
