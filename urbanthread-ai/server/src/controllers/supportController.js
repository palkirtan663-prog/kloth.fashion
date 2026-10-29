const SupportTicket = require('../models/SupportTicket');

// POST /api/support/tickets
async function createTicket(req, res) {
  const { category, orderId, subject, message, attachment, priority } = req.body || {};

  if (!subject || subject.trim().length < 3) {
    return res.status(400).json({ error: 'Inquiry subject is required.' });
  }

  if (!message || message.trim().length < 10) {
    return res.status(400).json({ error: 'Please describe your inquiry in detail (at least 10 characters).' });
  }

  const ticket = await SupportTicket.create({
    user: req.user.id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    category: category || 'General questions and complaints',
    orderId: String(orderId || '').trim(),
    subject: String(subject).trim(),
    message: String(message).trim(),
    attachment: String(attachment || '').trim(),
    priority: ['Low', 'Normal', 'High', 'Urgent'].includes(priority) ? priority : 'Normal',
    status: 'Open',
    replies: [],
  });

  res.status(201).json({ ticket, message: 'Support ticket opened successfully. Our team will review it shortly.' });
}

// GET /api/support/tickets/mine
async function getMyTickets(req, res) {
  const tickets = await SupportTicket.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ tickets });
}

// GET /api/support/tickets/:id
async function getTicketById(req, res) {
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Support ticket not found.' });

  if (req.user.role !== 'admin' && String(ticket.user) !== String(req.user.id)) {
    return res.status(403).json({ error: 'Not authorized to view this ticket.' });
  }

  res.json({ ticket });
}

// POST /api/support/tickets/:id/reply
async function replyToTicket(req, res) {
  const { message } = req.body || {};
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Reply message cannot be empty.' });
  }

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Support ticket not found.' });

  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && String(ticket.user) !== String(req.user.id)) {
    return res.status(403).json({ error: 'Not authorized to reply to this ticket.' });
  }

  ticket.replies.push({
    sender: req.user.name,
    senderRole: isAdmin ? 'admin' : 'user',
    message: String(message).trim(),
    timestamp: new Date(),
  });

  if (isAdmin) {
    ticket.status = 'Awaiting Customer';
  } else {
    ticket.status = 'In Review';
  }

  await ticket.save();
  res.json({ ticket, message: 'Reply sent successfully.' });
}

// ADMIN: GET /api/admin/support/tickets
async function listAllTickets(req, res) {
  const tickets = await SupportTicket.find().sort({ createdAt: -1 });
  res.json({ tickets });
}

// ADMIN: PATCH /api/admin/support/tickets/:id/status
async function updateTicketStatus(req, res) {
  const { status, priority } = req.body || {};
  const validStatuses = ['Open', 'In Review', 'Awaiting Customer', 'Resolved', 'Closed'];

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Support ticket not found.' });

  if (status && validStatuses.includes(status)) {
    ticket.status = status;
  }
  if (priority && ['Low', 'Normal', 'High', 'Urgent'].includes(priority)) {
    ticket.priority = priority;
  }

  await ticket.save();
  res.json({ ticket, message: 'Ticket updated successfully.' });
}

module.exports = {
  createTicket,
  getMyTickets,
  getTicketById,
  replyToTicket,
  listAllTickets,
  updateTicketStatus,
};
