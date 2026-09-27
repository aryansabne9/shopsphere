import { Router } from 'express';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.use(requireAuth);
router.get('/', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('cart.product');
  const items = user.cart.filter((item) => item.product).map((item) => ({ product: item.product, quantity: item.quantity }));
  res.json({ items });
}));
router.post('/', asyncHandler(async (req, res) => {
  const quantity = Number(req.body.quantity || 1);
  if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ message: 'Quantity must be a positive whole number.' });
  const product = await Product.findById(req.body.productId);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  const user = await User.findById(req.user.id);
  const item = user.cart.find((entry) => entry.product.equals(product.id));
  if ((item?.quantity || 0) + quantity > product.stock) return res.status(409).json({ message: `Only ${product.stock} available.` });
  if (item) item.quantity += quantity;
  else user.cart.push({ product: product.id, quantity });
  await user.save();
  await user.populate('cart.product');
  res.json({ items: user.cart.filter((entry) => entry.product).map((entry) => ({ product: entry.product, quantity: entry.quantity })) });
}));
router.patch('/:productId', asyncHandler(async (req, res) => {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ message: 'Quantity must be a positive whole number.' });
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  if (quantity > product.stock) return res.status(409).json({ message: `Only ${product.stock} available.` });
  const user = await User.findById(req.user.id);
  const item = user.cart.find((entry) => entry.product.equals(product.id));
  if (!item) return res.status(404).json({ message: 'Item not found in cart.' });
  item.quantity = quantity;
  await user.save();
  await user.populate('cart.product');
  res.json({ items: user.cart.filter((entry) => entry.product).map((entry) => ({ product: entry.product, quantity: entry.quantity })) });
}));
router.delete('/:productId', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  user.cart = user.cart.filter((entry) => !entry.product.equals(req.params.productId));
  await user.save();
  res.status(204).end();
}));
export default router;
