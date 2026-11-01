const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { normalizeEmail, EMAIL_RE } = require('../utils/validators');

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

  // 1. Validate complete shipping address
  if (!shippingAddress) {
    return res.status(400).json({ error: 'Complete shipping address is required.' });
  }

  const fullName = String(shippingAddress.fullName || '').trim();
  if (fullName.length < 2) {
    return res.status(400).json({ error: 'Please enter a valid recipient full name (min 2 characters).' });
  }

  const phone = String(shippingAddress.phone || '').trim().replace(/[\s-]/g, '');
  if (!/^\+?[0-9]{10,14}$/.test(phone)) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
  }

  const street = String(shippingAddress.street || '').trim();
  if (street.length < 4) {
    return res.status(400).json({ error: 'Please enter a complete delivery address (street/building).' });
  }

  const city = String(shippingAddress.city || '').trim();
  if (city.length < 2) {
    return res.status(400).json({ error: 'Please enter a valid city name.' });
  }

  const postalCode = String(shippingAddress.postalCode || '').trim();
  if (postalCode.length < 4) {
    return res.status(400).json({ error: 'Please enter a valid postal / PIN code.' });
  }

  // 2. Resolve or auto-register customer account
  let effectiveUser = req.user;
  let newlyIssuedToken = null;

  if (!effectiveUser) {
    const rawEmail = shippingAddress.email || req.body.customerEmail;
    if (!rawEmail || !EMAIL_RE.test(String(rawEmail).trim())) {
      return res.status(400).json({
        error: 'A valid email address is required for order tracking and confirmation.',
      });
    }

    const email = normalizeEmail(rawEmail);
    let existingUser = await User.findOne({ email });

    if (!existingUser) {
      // Auto-create customer account so order appears in their dashboard
      const autoPassword = 'Kloth@' + Math.random().toString(36).substring(2, 8) + '!';
      const passwordHash = await bcrypt.hash(autoPassword, 10);
      existingUser = await User.create({
        name: fullName,
        email,
        phone,
        passwordHash,
        role: 'user',
        address: {
          street,
          city,
          state: String(shippingAddress.state || 'Maharashtra').trim(),
          postalCode,
        },
      });
    }

    effectiveUser = existingUser;
    try {
      const jwtCfg = req.app?.locals?.config || {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
      };
      newlyIssuedToken = signToken(effectiveUser.id || effectiveUser._id, jwtCfg);
    } catch (e) {
      console.warn('[order] Auto-token issuance notice:', e.message);
    }
  }

  // 3. Verify stock availability and prices against catalog
  let subtotal = 0;
  const verifiedItems = [];

  for (const it of items) {
    const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
    const prodId = it.id || it.product;
    let catalogProduct = null;

    if (prodId && mongoose.Types.ObjectId.isValid(prodId)) {
      catalogProduct = await Product.findById(prodId);
    }
    if (!catalogProduct && it.name) {
      catalogProduct = await Product.findOne({ name: String(it.name).trim() });
    }

    if (catalogProduct) {
      // Check stock
      if (typeof catalogProduct.stock === 'number' && catalogProduct.stock < qty) {
        return res.status(400).json({
          error: `Sorry, "${catalogProduct.name}" has only ${catalogProduct.stock} pieces available in stock. Please adjust your bag quantity.`,
        });
      }
    }

    const unitPrice = catalogProduct ? catalogProduct.price : Math.max(0, parseFloat(it.price) || 0);
    subtotal += unitPrice * qty;

    verifiedItems.push({
      product: catalogProduct ? catalogProduct.id : (mongoose.Types.ObjectId.isValid(prodId) ? prodId : undefined),
      name: catalogProduct ? catalogProduct.name : String(it.name || 'Product').slice(0, 80),
      price: unitPrice,
      quantity: qty,
      size: String(it.size || 'M').slice(0, 10),
      color: catalogProduct?.color || String(it.color || '').slice(0, 40),
      image: catalogProduct?.image || String(it.image || '').slice(0, 500),
    });
  }

  // 4. Calculate discount if promo applied
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

  // 5. Duplicate order prevention (debounce 15 seconds)
  const fifteenSecAgo = new Date(Date.now() - 15000);
  const recentDuplicate = await Order.findOne({
    user: effectiveUser.id,
    total,
    createdAt: { $gte: fifteenSecAgo },
  });

  if (recentDuplicate) {
    return res.status(200).json({
      order: recentDuplicate,
      token: newlyIssuedToken,
      user: effectiveUser,
      notice: 'Order already confirmed.',
    });
  }

  // 6. Payment method configuration & simulation
  const paymentMethod = ['UPI', 'Card', 'COD', 'NetBanking'].includes(payment?.method)
    ? payment.method
    : 'COD';

  const isCod = paymentMethod === 'COD';
  const transactionId = isCod
    ? 'COD-PAY-ON-DELIVERY'
    : 'TXN-DEMO-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  const trackingNumber = 'KLOTH-' + Math.floor(100000 + Math.random() * 900000);

  // 7. Create order record
  const order = await Order.create({
    user: effectiveUser.id,
    customerName: effectiveUser.name || fullName,
    customerEmail: effectiveUser.email,
    items: verifiedItems,
    shippingAddress: {
      fullName,
      phone,
      street,
      city,
      state: String(shippingAddress.state || 'Maharashtra').trim(),
      postalCode,
    },
    payment: {
      method: paymentMethod,
      status: isCod ? 'pending' : 'completed',
      transactionId,
    },
    subtotal,
    discount,
    promoCode: promoUpper || '',
    shippingFee,
    total,
    status: 'Processing',
    trackingNumber,
    carrier: 'Streetwear Express',
    estimatedDelivery: formatEstDelivery(4),
    statusHistory: [
      {
        status: 'Processing',
        timestamp: new Date(),
        note: `Order received and confirmed. Payment mode: ${paymentMethod} (${isCod ? 'Cash on Delivery' : 'Demo Instant Settlement'}).`,
      },
    ],
  });

  // 8. Decrement stock for ordered items
  for (const it of verifiedItems) {
    if (it.product && mongoose.Types.ObjectId.isValid(it.product)) {
      try {
        await Product.findByIdAndUpdate(it.product, {
          $inc: { stock: -it.quantity },
        });
      } catch {}
    }
  }

  res.status(201).json({
    order,
    token: newlyIssuedToken,
    user: effectiveUser,
    message: 'Order placed successfully! Tracking number generated.',
  });
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
    order = await Order.findOne({
      $or: [
        { trackingNumber: new RegExp(`^${id}$`, 'i') },
        { orderNumber: new RegExp(`^${id}$`, 'i') },
      ],
    });
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

  // Restore inventory stock for cancelled items
  if (Array.isArray(order.items)) {
    for (const it of order.items) {
      if (it.product && mongoose.Types.ObjectId.isValid(it.product)) {
        try {
          await Product.findByIdAndUpdate(it.product, { $inc: { stock: it.quantity } });
        } catch {}
      }
    }
  }

  res.json({ order, message: 'Order successfully cancelled and stock restored.' });
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
