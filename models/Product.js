import mongoose from 'mongoose';

export default mongoose.model(
  'Product',
  new mongoose.Schema(
    {
      name: { type: String, required: true },
      price: Number,
      image: String,
      imageId: String, // Cloudinary public_id, used to delete the image
      owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true },
  ),
);
