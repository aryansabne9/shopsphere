import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js';

dotenv.config({ path: new URL('../../.env', import.meta.url) });

const products = [
  { name: 'Field Overshirt', category: 'Outerwear', price: 88, compareAtPrice: 110, stock: 24, featured: true, description: 'A light, structured layer cut from sturdy organic cotton. Finished with utility pockets and a relaxed shoulder.', imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85' },
  { name: 'Everyday Tote', category: 'Objects', price: 34, stock: 61, featured: true, description: 'Room for the daily essentials, made from heavy recycled canvas with an inside pocket and reinforced handles.', imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85' },
  { name: 'Ribbed Tank', category: 'Tops', price: 28, stock: 45, featured: false, description: 'A close but comfortable fit in soft, breathable cotton rib. Designed to wear alone or as a base layer.', imageUrl: 'https://images.unsplash.com/photo-1564257577-1d7a88c8c67c?auto=format&fit=crop&w=900&q=85' },
  { name: 'Sunday Knit', category: 'Knitwear', price: 96, compareAtPrice: 120, stock: 13, featured: true, description: 'A softly textured crew neck with an easy drape and a substantial hand feel for cooler mornings.', imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85' },
  { name: 'Canvas Weekender', category: 'Objects', price: 112, stock: 9, featured: true, description: 'A durable carryall for short trips, with a zip top, padded handles, and a separate shoe compartment.', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85' },
  { name: 'Relaxed Chino', category: 'Bottoms', price: 74, stock: 31, featured: false, description: 'An everyday trouser in midweight cotton twill with a straight leg, clean front, and adjustable waist tabs.', imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85' },
  { name: 'Studio Hoodie', category: 'Tops', price: 82, stock: 18, featured: false, description: 'Midweight loopback fleece with a clean silhouette, roomy front pocket, and thoughtful finishing.', imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85' },
  { name: 'Everyday Cap', category: 'Objects', price: 32, stock: 38, featured: false, description: 'A six-panel cotton cap with an adjustable strap and low-profile shape. Made for long days outside.', imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=85' },
  { name: 'Utility Jacket', category: 'Outerwear', price: 138, stock: 7, featured: true, description: 'A weather-ready jacket in tightly woven cotton, with a concealed placket and four practical pockets.', imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=900&q=85' },
  { name: 'Daily Tee', category: 'Tops', price: 36, stock: 53, featured: false, description: 'A reliable, midweight jersey tee with a considered neckline and a little extra room through the body.', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85' }
].map((product) => ({ ...product, slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));

try {
  await connectDatabase();
  await Product.deleteMany({});
  await Product.insertMany(products);
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    let admin = await User.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase() });
    if (!admin) admin = new User({ name: 'ShopSphere Admin', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'admin' });
    else { admin.password = process.env.ADMIN_PASSWORD; admin.role = 'admin'; }
    await admin.save();
    console.log(`Admin account ready for ${admin.email}.`);
  }
  console.log(`Seeded ${products.length} demo products.`);
} finally {
  await mongoose.disconnect();
}
