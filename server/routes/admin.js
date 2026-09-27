import { Router } from 'express';
import User from '../models/User.js';
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.use(requireAuth, requireAdmin);
router.get('/users', asyncHandler(async (_req, res) => {
  const users = await User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(200);
  res.json({ users });
}));
export default router;
