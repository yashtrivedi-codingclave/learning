import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: Number,
    image: String, // image URL (Cloudinary)
    imageId: String, // Cloudinary id, needed to delete the image
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who created it
  },
  { timestamps: true },
);

const Product = mongoose.model('Product', productSchema);

export default Product;
