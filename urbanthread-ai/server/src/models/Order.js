const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  size: { type: String, default: 'M' },
  color: { type: String, default: '' },
  image: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    payment: {
      method: { type: String, enum: ['UPI', 'Card', 'COD', 'NetBanking'], default: 'UPI' },
      status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
      transactionId: {
        type: String,
        default: () => 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      },
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    promoCode: { type: String, default: '' },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Processing', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Exchanged'],
      default: 'Processing',
    },
    trackingNumber: {
      type: String,
      unique: true,
      default: () => 'KLOTH-' + Math.floor(100000 + Math.random() * 900000),
    },
    carrier: { type: String, default: 'Streetwear Express' },
    estimatedDelivery: { type: String },
    statusHistory: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
    returnRequest: {
      status: {
        type: String,
        enum: ['None', 'Requested', 'Approved', 'Rejected', 'Completed'],
        default: 'None',
      },
      type: {
        type: String,
        enum: ['Return & Refund', 'Size Exchange', 'Replacement'],
        default: 'Return & Refund',
      },
      reason: { type: String, default: '' },
      details: { type: String, default: '' },
      preferredSize: { type: String, default: '' },
      requestedAt: { type: Date },
      resolvedAt: { type: Date },
      adminNote: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

orderSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
