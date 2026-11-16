import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import cloudinary from '../config/cloudinary.js';
import Product from './Product.js';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    dp: String, // Cloudinary URL
    dpId: String, // Cloudinary public_id
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true },
);

schema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10);
});

// When a user is deleted, also delete their products and those products' Cloudinary images
schema.post('findOneAndDelete', async (user) => {
  if (!user) return;
  const products = await Product.find({ owner: user._id });
  await Promise.all(products.map((p) => p.imageId && cloudinary.uploader.destroy(p.imageId)));
  await Product.deleteMany({ owner: user._id });
});

// Never send the password in any response
schema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model('User', schema);
