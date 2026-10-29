const CustomRequest = require('../models/CustomRequest');

// POST /api/custom-requests
async function createCustomRequest(req, res) {
  const {
    category,
    size,
    color,
    fabric,
    measurements,
    quantity,
    budget,
    description,
    referenceImage,
    customerPhone,
  } = req.body || {};

  if (!description || description.trim().length < 10) {
    return res.status(400).json({ error: 'Please provide a detailed description of your custom design (at least 10 characters).' });
  }

  const customReq = await CustomRequest.create({
    user: req.user.id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    customerPhone: String(customerPhone || req.user.phone || '').trim(),
    category: category || 'T-Shirts',
    size: String(size || 'Custom').trim(),
    color: String(color || '').trim(),
    fabric: String(fabric || 'Heavyweight Cotton').trim(),
    measurements: typeof measurements === 'object' && measurements !== null ? measurements : {},
    quantity: Math.max(1, parseInt(quantity, 10) || 1),
    budget: Math.max(0, parseFloat(budget) || 0),
    description: String(description).trim(),
    referenceImage: String(referenceImage || '').trim(),
    status: 'Submitted',
  });

  res.status(201).json({ customRequest: customReq, message: 'Custom design request submitted successfully.' });
}

// GET /api/custom-requests/mine
async function getMyCustomRequests(req, res) {
  const requests = await CustomRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ requests });
}

// GET /api/custom-requests/:id
async function getCustomRequestById(req, res) {
  const request = await CustomRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Custom request not found.' });

  if (req.user.role !== 'admin' && String(request.user) !== String(req.user.id)) {
    return res.status(403).json({ error: 'Not authorized to view this request.' });
  }

  res.json({ request });
}

// PATCH /api/custom-requests/:id/respond (Customer accepts/declines quotation)
async function respondToQuote(req, res) {
  const { decision } = req.body || {}; // 'accept' | 'decline'
  const request = await CustomRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Custom request not found.' });

  if (String(request.user) !== String(req.user.id)) {
    return res.status(403).json({ error: 'Not authorized to respond to this request.' });
  }

  if (request.status !== 'Quotation Provided') {
    return res.status(400).json({ error: 'A quote must be provided before accepting or declining.' });
  }

  if (decision === 'accept') {
    request.status = 'Quotation Accepted';
  } else if (decision === 'decline') {
    request.status = 'Quotation Declined';
  } else {
    return res.status(400).json({ error: 'Decision must be either "accept" or "decline".' });
  }

  await request.save();
  res.json({ request, message: `Quotation has been ${decision}ed.` });
}

// ADMIN: GET /api/admin/custom-requests
async function listAllCustomRequests(req, res) {
  const requests = await CustomRequest.find().sort({ createdAt: -1 });
  res.json({ requests });
}

// ADMIN: PATCH /api/admin/custom-requests/:id/quote
async function provideQuote(req, res) {
  const { price, estimatedDays, notes } = req.body || {};
  if (price === undefined || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
    return res.status(400).json({ error: 'Valid quotation price (INR) is required.' });
  }

  const request = await CustomRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Custom request not found.' });

  request.quote = {
    price: parseFloat(price),
    estimatedDays: parseInt(estimatedDays, 10) || 7,
    notes: String(notes || '').trim(),
    quotedAt: new Date(),
  };
  request.status = 'Quotation Provided';

  await request.save();
  res.json({ request, message: 'Quotation provided to customer successfully.' });
}

// ADMIN: PATCH /api/admin/custom-requests/:id/status
async function updateCustomRequestStatus(req, res) {
  const { status, adminNotes } = req.body || {};
  const validStatuses = [
    'Submitted',
    'Under Review',
    'Quotation Provided',
    'Quotation Accepted',
    'Quotation Declined',
    'In Production',
    'Shipped',
    'Completed',
    'Cancelled',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const request = await CustomRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Custom request not found.' });

  request.status = status;
  if (adminNotes) request.adminNotes = String(adminNotes).trim();

  await request.save();
  res.json({ request, message: `Status updated to ${status}.` });
}

module.exports = {
  createCustomRequest,
  getMyCustomRequests,
  getCustomRequestById,
  respondToQuote,
  listAllCustomRequests,
  provideQuote,
  updateCustomRequestStatus,
};
