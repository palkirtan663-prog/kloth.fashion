const mongoose = require('mongoose');
const { ROLES, EMAIL_RE } = require('../utils/validators');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required.'], trim: true, minlength: 2, maxlength: 50 },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    match: [EMAIL_RE, 'Enter a valid email address.'],
  },
  // select:false -> the hash is NOT loaded unless a query asks for it with .select('+passwordHash')
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ROLES, default: 'user' },
  phone: { type: String, trim: true, default: '' },
  address: {
    street: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    postalCode: { type: String, trim: true, default: '' },
  },
  notificationPreferences: {
    marketing: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    restocks: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
});

// Defence in depth: even if a hash is loaded, it is never serialised into an API response.
userSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
