import { Router } from 'express';
import crypto from 'node:crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ orders });
}));
router.get('/admin/all', requireAuth, requireAdmin, asyncHandler(async (_req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(200);
  res.json({ orders });
}));
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const address = req.body.address || {};
  if (!['name', 'line1', 'city', 'postalCode', 'country'].every((key) => address[key]?.trim())) return res.status(400).json({ message: 'Complete every delivery address field.' });
  const user = await User.findById(req.user.id).populate('cart.product');
  const items = user.cart.filter((entry) => entry.product).map((entry) => ({ product: entry.product, quantity: entry.quantity }));
  if (!items.length) return res.status(400).json({ message: 'Your cart is empty.' });
  const subtotal = Number(items.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2));
  const shipping = subtotal >= 75 ? 0 : 7.95;
  const reserved = [];
  let order;
  try {
    for (const item of items) {
      const product = await Product.findOneAndUpdate({ _id: item.product.id, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }, { new: true });
      if (!product) throw Object.assign(new Error(`${item.product.name} no longer has enough stock.`), { status: 409 });
      reserved.push({ id: product.id, quantity: item.quantity });
    }
    order = await Order.create({
      orderNumber: `SS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      user: user.id,
      items: items.map(({ product, quantity }) => ({ product: product.id, name: product.name, imageUrl: product.imageUrl, unitPrice: product.price, quantity })),
      subtotal, shipping, total: Number((subtotal + shipping).toFixed(2)),
      address: { name: address.name.trim(), line1: address.line1.trim(), city: address.city.trim(), postalCode: address.postalCode.trim(), country: address.country.trim() }
    });
    user.cart = [];
    await user.save();
  } catch (error) {
    if (order) await Order.deleteOne({ _id: order.id });
    await Promise.all(reserved.map((item) => Product.updateOne({ _id: item.id }, { $inc: { stock: item.quantity } })));
    throw error;
  }
  res.status(201).json({ order });
}));
router.patch('/:id/status', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const allowed = ['processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Choose a valid order status.' });
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  res.json({ order });
}));
export default router;
