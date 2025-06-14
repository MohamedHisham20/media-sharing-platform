import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  title: String,
  url: String,
  type: String,
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.model('Media', mediaSchema);