// ================= src/index.ts =================
import express from 'express';
import mongoose from 'mongoose';
import { MONGO_URI , PORT } from './config';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import mediaRoutes from './routes/media.routes';

const app = express();

// CORS middleware
app.use(cors({
  origin: '*', // Or specify your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Type'],
}));

// Custom middleware to allow Range header for video streaming
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Or your frontend URL
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Range');
  res.header('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length, Content-Type');
  next();
});

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/users', userRoutes);
app.use('/api/media', mediaRoutes);

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));
