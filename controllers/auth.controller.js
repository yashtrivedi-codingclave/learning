import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mailer from '../config/mailer.js';
import cloudinary from '../config/cloudinary.js';
import User from '../models/User.js';

// Escape HTML so a name like "<a>" shows as text in the email instead of rendering
const escape = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const token = (user) => ({
  token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  role: user.role,
});

export const register = async (req, res) => {
  const { name, email, password, dp, dpId } = req.body; // never take role from the body, or anyone could register as admin
  const user = await User.create({ name, email, password, dp, dpId }).catch(async (err) => {
    if (dpId) await cloudinary.uploader.destroy(dpId); // registration failed (e.g. duplicate email), so remove the uploaded dp
    throw err;
  });
  mailer
    .sendMail({ to: email, subject: 'Welcome!', html: `<h2>Welcome ${escape(name)}</h2>` })
    .catch(console.error);
  res.status(201).json(token(user));
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await bcrypt.compare(req.body.password, user.password)))
    return res.status(401).json({ message: 'Invalid email or password' });
  res.json(token(user));
};

export const me = (req, res) => res.json(req.user);
