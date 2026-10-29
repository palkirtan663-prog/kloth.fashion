const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    type: {
      type: String,
      enum: ['announcement', 'collection', 'promo', 'order', 'system'],
      default: 'announcement',
    },
    targetRole: { type: String, enum: ['all', 'user', 'admin'], default: 'all' },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readBy: [{ type: String }],
    link: { type: String, trim: true, default: '' },
    tag: { type: String, trim: true, default: 'ALERT' },
  },
  { timestamps: true }
);

notificationSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
