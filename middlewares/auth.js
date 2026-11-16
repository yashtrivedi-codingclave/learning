import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Step 1: Is the user logged in?
// The client sends the header:  Authorization: Bearer <token>
export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Please login' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // { id: '...' }
    req.user = await User.findById(decoded.id);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'User no longer exists' });
  }

  next();
};

// Step 2 (RBAC): Is the logged-in user an admin?
// Always use it after protect:  router.use(protect, adminOnly)
export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }
  next();
};
