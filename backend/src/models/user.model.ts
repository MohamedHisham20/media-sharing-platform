import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  likedMedia: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
  dislikedMedia: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
  profilePicture: { type: String, default: '' }, // URL to profile picture
  uploadedMedia: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
});

export default mongoose.model('User', userSchema);