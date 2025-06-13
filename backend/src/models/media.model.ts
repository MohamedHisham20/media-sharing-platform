import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  title: String,
  url: String,
  type: String,
  likes: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.model('Media', mediaSchema);