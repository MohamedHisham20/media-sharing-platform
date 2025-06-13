// ================= src/index.ts =================
import express from 'express';
import mongoose from 'mongoose';
import { MONGO_URI , PORT } from './config';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import mediaRoutes from './routes/media.routes';

const app = express();
app.use(cors());
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
