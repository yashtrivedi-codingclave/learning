import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import { paginate } from '../utils/paginate.js';

// All these routes are admin only (see routes/user.routes.js)

// GET /api/users?page=1&limit=10
export const getUsers = async (req, res) => {
  const result = await paginate(User, {}, req.query);
  res.json(result);
};

// GET /api/users/:id
export const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
};

// POST /api/users   (form-data: name, email, password, role, dp)
export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  let dp, dpId;
  if (req.file) {
    const image = await uploadImage(req.file);
    dp = image.url;
    dpId = image.id;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, role, dp, dpId });

  user.password = undefined; // never send the password back
  res.status(201).json(user);
};

// PUT /api/users/:id   (send only the fields you want to change)
export const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const oldDpId = user.dpId; // remember it, so we can delete it after the update
  const updates = req.body;

  // New password? Hash it first.
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }

  // New profile picture? Upload it.
  if (req.file) {
    const image = await uploadImage(req.file);
    updates.dp = image.url;
    updates.dpId = image.id;
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true, // return the updated user, not the old one
    runValidators: true,
  });

  // The new picture is saved, so now delete the old one from Cloudinary
  if (req.file) {
    await deleteImage(oldDpId);
  }

  res.json(updatedUser);
};

// DELETE /api/users/:id   (also deletes the user's products and all their images)
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // 1. Delete this user's products and their images
  const products = await Product.find({ owner: user._id });
  for (const product of products) {
    await deleteImage(product.imageId);
  }
  await Product.deleteMany({ owner: user._id });

  // 2. Delete the user's profile picture and the user
  await deleteImage(user.dpId);
  await User.findByIdAndDelete(user._id);

  res.json({ message: 'User and their products deleted' });
};
