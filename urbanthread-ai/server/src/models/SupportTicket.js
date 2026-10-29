const mongoose = require('mongoose');

const TICKET_CATEGORIES = [
  'Order status and tracking',
  'Cancellation requests',
  'Return requests',
  'Refund requests',
  'Size and product exchanges',
  'Damaged or incorrect products',
  'Payment issues',
  'Delivery problems',
  'Account and login issues',
  'General questions and complaints',
  'Contact customer support',
];

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      default: () => 'TKT-' + Math.floor(100000 + Math.random() * 900000),
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: [true, 'Category is required.'],
      enum: TICKET_CATEGORIES,
      default: 'General questions and complaints',
    },
    orderId: { type: String, trim: true, default: '' },
    subject: { type: String, required: [true, 'Subject is required.'], trim: true, maxlength: 200 },
    message: { type: String, required: [true, 'Message description is required.'], trim: true, maxlength: 3000 },
    attachment: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['Open', 'In Review', 'Awaiting Customer', 'Resolved', 'Closed'],
      default: 'Open',
    },
    priority: {
      type: String,
      enum: ['Low', 'Normal', 'High', 'Urgent'],
      default: 'Normal',
    },
    replies: [
      {
        sender: { type: String, required: true },
        senderRole: { type: String, enum: ['user', 'admin'], default: 'user' },
        message: { type: String, required: true, trim: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

supportTicketSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = {
  SupportTicket: mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema),
  TICKET_CATEGORIES,
};
