import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, name: String, imageUrl: String, unitPrice: Number, quantity: Number }],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true },
  address: { name: String, line1: String, city: String, postalCode: String, country: String },
  status: { type: String, enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'placed' }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
