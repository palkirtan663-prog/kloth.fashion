const mongoose = require('mongoose');

const customRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      default: () => 'CR-' + Math.floor(100000 + Math.random() * 900000),
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true },
    customerPhone: { type: String, trim: true, default: '' },
    category: {
      type: String,
      required: [true, 'Clothing category is required.'],
      enum: ['T-Shirts', 'Shirts', 'Hoodies', 'Jackets', 'Baggy Jeans', 'Cargo Pants', 'Dresses', 'Co-ords', 'Accessories', 'Other'],
      default: 'T-Shirts',
    },
    size: { type: String, default: 'Custom' },
    color: { type: String, trim: true, default: '' },
    fabric: { type: String, trim: true, default: 'Heavyweight Cotton' },
    measurements: {
      chest: { type: String, default: '' },
      waist: { type: String, default: '' },
      hips: { type: String, default: '' },
      length: { type: String, default: '' },
      shoulder: { type: String, default: '' },
      inseam: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    quantity: { type: Number, min: 1, default: 1 },
    budget: { type: Number, min: 0, default: 0 },
    description: { type: String, required: [true, 'Design description is required.'], trim: true, maxlength: 2000 },
    referenceImage: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'Quotation Provided',
        'Quotation Accepted',
        'Quotation Declined',
        'In Production',
        'Shipped',
        'Completed',
        'Cancelled',
      ],
      default: 'Submitted',
    },
    quote: {
      price: { type: Number, default: 0 },
      estimatedDays: { type: Number, default: 7 },
      notes: { type: String, default: '' },
      quotedAt: { type: Date },
    },
    history: [
      {
        status: { type: String },
        note: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

customRequestSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.models.CustomRequest || mongoose.model('CustomRequest', customRequestSchema);
