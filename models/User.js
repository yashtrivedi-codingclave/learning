import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // select: false = not returned by find()
    dp: String, // profile picture URL (Cloudinary)
    dpId: String, // Cloudinary id, needed to delete the picture
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }, // adds createdAt and updatedAt
);

const User = mongoose.model('User', userSchema);

export default User;
