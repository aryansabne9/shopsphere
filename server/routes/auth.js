import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });
const issueToken = (user) => jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  const user = await User.create({ name: name.trim(), email: email.trim(), password });
  res.status(201).json({ token: issueToken(user), user: publicUser(user) });
}));
router.post('/login', asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.trim().toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password || ''))) return res.status(401).json({ message: 'Email or password is incorrect.' });
  res.json({ token: issueToken(user), user: publicUser(user) });
}));
router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
router.patch('/me', requireAuth, asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  if (!name || !email) return res.status(400).json({ message: 'Name and email are required.' });
  req.user.name = name;
  req.user.email = email;
  await req.user.save();
  res.json({ user: publicUser(req.user) });
}));
export default router;
