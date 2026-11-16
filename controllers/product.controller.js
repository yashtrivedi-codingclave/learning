import Product from '../models/Product.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import { paginate } from '../utils/paginate.js';

// RBAC rule for products:
//   admin -> can see and change every product
//   user  -> can see and change only their own products
const productFilter = (req) => {
  if (req.user.role === 'admin') {
    return {}; // no filter = all products
  }
  return { owner: req.user._id }; // only products this user created
};

// GET /api/products?page=1&limit=10
export const getProducts = async (req, res) => {
  const result = await paginate(Product, productFilter(req), req.query);
  res.json(result);
};

// GET /api/products/:id
export const getProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, ...productFilter(req) });
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
};

// POST /api/products   (form-data: name, price, image)
export const createProduct = async (req, res) => {
  const { name, price } = req.body;

  let image, imageId;
  if (req.file) {
    const uploaded = await uploadImage(req.file);
    image = uploaded.url;
    imageId = uploaded.id;
  }

  // owner is always the logged-in user
  const product = await Product.create({ name, price, image, imageId, owner: req.user._id });
  res.status(201).json(product);
};

// PUT /api/products/:id   (send only the fields you want to change)
export const updateProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, ...productFilter(req) });
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const oldImageId = product.imageId; // remember it, so we can delete it after the update
  const updates = req.body; // only name / price (validator removed everything else)

  // New image? Upload it.
  if (req.file) {
    const uploaded = await uploadImage(req.file);
    updates.image = uploaded.url;
    updates.imageId = uploaded.id;
  }

  const updatedProduct = await Product.findByIdAndUpdate(product._id, updates, {
    new: true,
    runValidators: true,
  });

  // The new image is saved, so now delete the old one from Cloudinary
  if (req.file) {
    await deleteImage(oldImageId);
  }

  res.json(updatedProduct);
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, ...productFilter(req) });
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  await deleteImage(product.imageId);
  await Product.findByIdAndDelete(product._id);

  res.json({ message: 'Product deleted' });
};
