import jwt from 'jsonwebtoken';
import { store } from '../services/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cineverse_super_secret_jwt_key_2026';

export const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '30d' });
};

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const user = await store.findUserById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found or session expired' });
      }

      req.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone
      };
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No authorization token provided' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin privilege required' });
  }
};
