import cloudinary from '../config/cloudinary.js';
import User from '../models/User.js';
import { paginate } from '../utils/paginate.js';

// All user routes are admin only (see routes/user.routes.js)

export const getUsers = async (req, res) => {
  res.json(await paginate(User, {}, req.query));
};

export const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

export const createUser = async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
};

export const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const oldDpId = user.dpId;
  Object.assign(user, req.body);
  await user.save(); // save() (not findByIdAndUpdate) so a new password gets hashed

  // A new dp was uploaded, so delete the old one from Cloudinary
  if (req.body.dpId && oldDpId) await cloudinary.uploader.destroy(oldDpId);
  res.json(user);
};

export const deleteUser = async (req, res) => {
  // The User model hook also deletes this user's products and their images
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.dpId) await cloudinary.uploader.destroy(user.dpId);
  res.json({ message: 'User deleted' });
};
