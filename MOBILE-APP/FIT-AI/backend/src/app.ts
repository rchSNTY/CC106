import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error-middleware';
import aiRoutes from './routes/ai-routes';
import authRoutes from './routes/auth-routes';
import favoriteRoutes from './routes/favorite-routes';
import historyRoutes from './routes/history-routes';
import profileRoutes from './routes/profile-routes';
import workoutRoutes from './routes/workout-routes';

const app = express();

app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    storage: 'json-file',
    dbFuture: 'mongodb-ready-architecture',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/ai', aiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
