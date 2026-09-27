import { Router } from 'express';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.use(requireAuth);
router.get('/', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist');
  res.json({ products: user.wishlist });
}));
router.put('/:productId', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  const user = await User.findById(req.user.id);
  const exists = user.wishlist.some((id) => id.equals(product.id));
  user.wishlist = exists ? user.wishlist.filter((id) => !id.equals(product.id)) : [...user.wishlist, product.id];
  await user.save();
  res.json({ saved: !exists });
}));
export default router;
