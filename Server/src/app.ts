import express from 'express';
import cors from 'cors';
import path from 'path';
import itemRoutes from './routes/itemRoutes';
import authRoutes from './routes/authRoutes';
import mapRoutes from './routes/mapRoutes';
import sprinklerRoutes from './routes/sprinklerRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/items', itemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api', sprinklerRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
