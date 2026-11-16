import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// auth() = must be logged in, auth('admin') = must be logged in with the admin role (RBAC)
export const auth =
  (...roles) =>
  async (req, res, next) => {
    try {
      req.user = await User.findById(
        jwt.verify(req.headers.authorization?.split(' ')[1], process.env.JWT_SECRET).id,
      );
    } catch {}
    if (!req.user) return res.status(401).json({ message: 'Please login' });
    if (roles.length && !roles.includes(req.user.role))
      return res.status(403).json({ message: 'Access denied' });
    next();
  };
