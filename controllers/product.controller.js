import cloudinary from '../config/cloudinary.js';
import Product from '../models/Product.js';
import { paginate } from '../utils/paginate.js';

// Admin can access every product, a normal user only their own
const ownerFilter = (req) => (req.user.role === 'admin' ? {} : { owner: req.user._id });

export const getProducts = async (req, res) => {
  res.json(await paginate(Product, ownerFilter(req), req.query));
};

export const getProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, ...ownerFilter(req) });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

export const createProduct = async (req, res) => {
  const product = await Product.create({ ...req.body, owner: req.user._id });
  res.status(201).json(product);
};

export const updateProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, ...ownerFilter(req) });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const oldImageId = product.imageId;
  Object.assign(product, req.body); // req.body is already validated, so owner can't be changed
  await product.save();

  // A new image was uploaded, so delete the old one from Cloudinary
  if (req.body.imageId && oldImageId) await cloudinary.uploader.destroy(oldImageId);
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findOneAndDelete({ _id: req.params.id, ...ownerFilter(req) });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  if (product.imageId) await cloudinary.uploader.destroy(product.imageId);
  res.json({ message: 'Product deleted' });
};
