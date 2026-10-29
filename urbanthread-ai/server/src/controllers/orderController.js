const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Valid promo codes with percentage or flat discounts
const PROMO_CODES = {
  STREET20: { type: 'percent', value: 20, description: '20% Off on everything' },
  FIRSTBUY: { type: 'flat', value: 500, minOrder: 1500, description: '₹500 Off on orders above ₹1,500' },
  URBAN10: { type: 'percent', value: 10, description: '10% Off on your order' },
  FREESHIP: { type: 'shipping', value: 0, description: 'Free Express Shipping' },
};

function formatEstDelivery(daysFromNow = 4) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

// POST /api/orders
async function createOrder(req, res) {
  const { items, shippingAddress, payment, promoCode } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty. Add pieces to order.' });
  }

  if (
    !shippingAddress ||
    !shippingAddress.fullName ||
    !shippingAddress.phone ||
    !shippingAddress.street ||
    !shippingAddress.city ||
    !shippingAddress.postalCode
  ) {
    return res.status(400).json({ error: 'Complete shipping address is required.' });
  }

  // Calculate and verify totals safely
  let subtotal = 0;
  const verifiedItems = items.map((it) => {
    const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
    const price = Math.max(0, parseFloat(it.price) || 0);
    subtotal += price * qty;
    return {
      product: mongoose.Types.ObjectId.isValid(it.id || it.product) ? (it.id || it.product) : undefined,
      name: String(it.name || 'Product').slice(0, 80),
      price,
      quantity: qty,
      size: String(it.size || 'M').slice(0, 10),
      color: String(it.color || '').slice(0, 40),
      image: String(it.image || '').slice(0, 500),
    };
  });

  // Calculate discount if promo applied
  let discount = 0;
  const promoUpper = String(promoCode || '').trim().toUpperCase();
  if (promoUpper && PROMO_CODES[promoUpper]) {
    const p = PROMO_CODES[promoUpper];
    if (p.type === 'percent') {
      discount = Math.round((subtotal * p.value) / 100);
    } else if (p.type === 'flat') {
      discount = subtotal >= (p.minOrder || 0) ? p.value : 0;
    }
  }

  const shippingFee = subtotal >= 1499 || (promoUpper === 'FREESHIP') ? 0 : 149;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const paymentMethod = ['UPI', 'Card', 'COD', 'NetBanking'].includes(payment?.method)
    ? payment.method
    : 'UPI';

  const order = await Order.create({
    user: req.user.id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    items: verifiedItems,
    shippingAddress: {
      fullName: String(shippingAddress.fullName).trim(),
      phone: String(shippingAddress.phone).trim(),
      street: String(shippingAddress.street).trim(),
      city: String(shippingAddress.city).trim(),
      state: String(shippingAddress.state || 'Maharashtra').trim(),
      postalCode: String(shippingAddress.postalCode).trim(),
    },
    payment: {
      method: paymentMethod,
      status: paymentMethod === 'COD' ? 'pending' : 'completed',
      transactionId:
        paymentMethod === 'COD'
          ? 'COD-PAY-ON-DELIVERY'
          : 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    },
    subtotal,
    discount,
    promoCode: promoUpper || '',
    shippingFee,
    total,
    status: 'Processing',
    carrier: 'Streetwear Express',
    estimatedDelivery: formatEstDelivery(4),
    statusHistory: [
      {
        status: 'Processing',
        timestamp: new Date(),
        note: `Order received and confirmed. Payment method: ${paymentMethod}.`,
      },
    ],
  });

  res.status(201).json({ order });
}

// GET /api/orders/mine
async function getMyOrders(req, res) {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ orders });
}

// GET /api/orders/track/:identifier (works by trackingNumber OR order ID)
async function getOrderByIdOrTracking(req, res) {
  const id = String(req.params.identifier || '').trim();
  let order;
  if (mongoose.Types.ObjectId.isValid(id)) {
    order = await Order.findById(id);
  }
  if (!order) {
    order = await Order.findOne({ trackingNumber: new RegExp(`^${id}$`, 'i') });
  }

  if (!order) {
    return res.status(404).json({ error: 'Order not found with that Tracking Number or ID.' });
  }

  res.json({ order });
}

// GET /api/admin/orders
async function listAllOrders(req, res) {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json({ orders });
}

// PATCH /api/admin/orders/:id/status
async function updateOrderStatus(req, res) {
  const { status, note } = req.body || {};
  const validStatuses = ['Processing', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  order.status = status;
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    note: note || `Status updated to ${status} by admin.`,
  });

  await order.save();
  res.json({ order });
}

// POST /api/orders/:id/cancel
async function cancelOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  if (req.user.role !== 'admin' && String(order.user) !== String(req.user.id)) {
    return res.status(403).json({ error: 'Not authorized to cancel this order.' });
  }

  const unCancellableStatuses = ['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];
  if (unCancellableStatuses.includes(order.status)) {
    return res.status(400).json({
      error: `Cannot cancel an order that is already ${order.status.toLowerCase()}. You may request a return after delivery.`,
    });
  }

  order.status = 'Cancelled';
  order.statusHistory.push({
    status: 'Cancelled',
    timestamp: new Date(),
    note: req.body?.reason ? `Cancelled by customer: ${req.body.reason}` : 'Cancelled by customer before dispatch.',
  });

  await order.save();
  res.json({ order, message: 'Order successfully cancelled.' });
}

// POST /api/orders/:id/return
async function requestReturn(req, res) {
  const { type, reason, details, preferredSize } = req.body || {};
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  if (req.user.role !== 'admin' && String(order.user) !== String(req.user.id)) {
    return res.status(403).json({ error: 'Not authorized to request return for this order.' });
  }

  if (order.status !== 'Delivered') {
    return res.status(400).json({ error: 'Return/Exchange can only be requested once the order is marked Delivered.' });
  }

  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ error: 'Please provide a clear reason for return/exchange (at least 5 characters).' });
  }

  const requestType = ['Return & Refund', 'Size Exchange', 'Replacement'].includes(type) ? type : 'Return & Refund';

  order.returnRequest = {
    status: 'Requested',
    type: requestType,
    reason: String(reason).trim(),
    details: String(details || '').trim(),
    preferredSize: String(preferredSize || '').trim(),
    requestedAt: new Date(),
    adminNote: '',
  };

  order.statusHistory.push({
    status: order.status,
    timestamp: new Date(),
    note: `Return/Exchange (${requestType}) requested by customer. Reason: ${reason}`,
  });

  await order.save();
  res.json({ order, message: `${requestType} request submitted successfully.` });
}

// PATCH /api/admin/orders/:id/return-status
async function handleReturnRequest(req, res) {
  const { status, adminNote } = req.body || {};
  const validReturnStatuses = ['Approved', 'Rejected', 'Completed'];
  if (!validReturnStatuses.includes(status)) {
    return res.status(400).json({ error: `Return status must be one of: ${validReturnStatuses.join(', ')}` });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  if (!order.returnRequest || order.returnRequest.status === 'None') {
    return res.status(400).json({ error: 'No return request found on this order.' });
  }

  order.returnRequest.status = status;
  order.returnRequest.resolvedAt = new Date();
  if (adminNote) order.returnRequest.adminNote = String(adminNote).trim();

  if (status === 'Completed' || status === 'Approved') {
    if (order.returnRequest.type === 'Return & Refund') {
      order.status = 'Returned';
    } else if (order.returnRequest.type === 'Size Exchange') {
      order.status = 'Exchanged';
    }
  }

  order.statusHistory.push({
    status: order.status,
    timestamp: new Date(),
    note: `Return/Exchange request marked ${status} by admin. Note: ${adminNote || 'No notes provided.'}`,
  });

  await order.save();
  res.json({ order, message: `Return request updated to ${status}.` });
}

// GET /api/admin/stats
async function getAdminStats(req, res) {
  const CustomRequest = require('../models/CustomRequest');
  const SupportTicket = require('../models/SupportTicket');

  const [totalOrders, orders, totalUsers, totalProducts, products] = await Promise.all([
    Order.countDocuments(),
    Order.find().select('total status createdAt items returnRequest'),
    User.countDocuments(),
    Product.countDocuments(),
    Product.find().select('stock name category price'),
  ]);

  let totalCustomRequests = 0;
  let pendingCustomRequests = 0;
  try {
    totalCustomRequests = await CustomRequest.countDocuments();
    pendingCustomRequests = await CustomRequest.countDocuments({ status: { $in: ['Submitted', 'Under Review'] } });
  } catch {}

  let totalTickets = 0;
  let openTickets = 0;
  try {
    totalTickets = await SupportTicket.countDocuments();
    openTickets = await SupportTicket.countDocuments({ status: { $in: ['Open', 'In Review'] } });
  } catch {}

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingReturns = orders.filter((o) => o.returnRequest && o.returnRequest.status === 'Requested').length;
  const lowStock = products.filter((p) => typeof p.stock === 'number' && p.stock < 10);

  // Status breakdown
  const statusCounts = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  res.json({
    totalRevenue,
    totalOrders,
    totalUsers,
    totalProducts,
    pendingReturns,
    lowStockCount: lowStock.length,
    lowStockItems: lowStock.slice(0, 5),
    totalCustomRequests,
    pendingCustomRequests,
    totalTickets,
    openTickets,
    statusCounts,
  });
}

// GET /api/orders/offers
function getLiveOffers(req, res) {
  res.json({
    offers: [
      { code: 'STREET20', title: '20% OFF Everything', desc: 'Flat 20% discount on entire street edit', badge: 'FLASH SALE' },
      { code: 'FIRSTBUY', title: '₹500 OFF', desc: 'On minimum order value of ₹1,500', badge: 'NEW USER' },
      { code: 'URBAN10', title: '10% Extra Discount', desc: 'Applicable with all payment modes', badge: 'HOT' },
      { code: 'FREESHIP', title: 'Zero Shipping Fee', desc: 'Free express doorstep delivery across India', badge: 'LIMITED' },
    ],
  });
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderByIdOrTracking,
  listAllOrders,
  updateOrderStatus,
  cancelOrder,
  requestReturn,
  handleReturnRequest,
  getAdminStats,
  getLiveOffers,
};
