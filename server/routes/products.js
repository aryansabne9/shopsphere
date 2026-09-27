import { Router } from 'express';
import Product from '../models/Product.js';
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
const productData = (body) => {
  const name = body.name?.trim();
  return {
    name,
    slug: name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    description: body.description?.trim(),
    category: body.category?.trim(),
    price: Number(body.price),
    compareAtPrice: body.compareAtPrice == null || body.compareAtPrice === '' ? null : Number(body.compareAtPrice),
    imageUrl: body.imageUrl?.trim(),
    stock: Number(body.stock),
    featured: Boolean(body.featured)
  };
};

router.get('/', asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.q) filter.$text = { $search: req.query.q };
  if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
  if (req.query.maxPrice) filter.price = { $lte: Number(req.query.maxPrice) };
  if (req.query.inStock === 'true') filter.stock = { $gt: 0 };
  const sort = req.query.sort === 'price-low' ? { price: 1 } : req.query.sort === 'price-high' ? { price: -1 } : req.query.sort === 'newest' ? { createdAt: -1 } : { featured: -1, createdAt: -1 };
  const products = await Product.find(filter).sort(req.query.q ? { score: { $meta: 'textScore' } } : sort).limit(100);
  res.json({ products });
}));
router.get('/:slug', asyncHandler(async (req, res) => {
  const product = await Product.findOne({ $or: [{ slug: req.params.slug }, ...(req.params.slug.match(/^[a-f\d]{24}$/i) ? [{ _id: req.params.slug }] : [])] });
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  res.json({ product });
}));
router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const product = await Product.create(productData(req.body));
  res.status(201).json({ product });
}));
router.patch('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, productData(req.body), { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  res.json({ product });
}));
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  res.status(204).end();
}));
export default router;
