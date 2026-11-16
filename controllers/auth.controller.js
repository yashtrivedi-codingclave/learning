import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { uploadImage } from '../config/cloudinary.js';
import { sendMail } from '../config/mailer.js';

// Create a login token that is valid for 7 days
const createToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register   (form-data: name, email, password, dp)
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Email already used?
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  // 2. Upload the profile picture to Cloudinary (if one was sent)
  let dp, dpId;
  if (req.file) {
    const image = await uploadImage(req.file);
    dp = image.url;
    dpId = image.id;
  }

  // 3. Hash the password and save the user.
  //    role is NOT taken from the body, so nobody can register as admin.
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, dp, dpId });

  // 4. Send the welcome email. We don't wait for it, and a mail error won't break register.
  sendMail(email, 'Welcome!', `Hi ${name}, welcome to our app!`).catch(console.error);

  res.status(201).json({ token: createToken(user), role: user.role });
};

// POST /api/auth/login   (email, password)
export const login = async (req, res) => {
  const { email, password } = req.body;

  // password has select: false, so ask for it explicitly
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({ token: createToken(user), role: user.role });
};

// GET /api/auth/me   (logged-in user's own profile)
export const getMe = (req, res) => {
  res.json(req.user);
};
