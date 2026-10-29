const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    subtitle: { type: String, trim: true, default: '' },
    badge: { type: String, trim: true, default: 'NEW DROP' },
    image: { type: String, required: true, trim: true },
    ctaText: { type: String, trim: true, default: 'Shop Now' },
    ctaLink: { type: String, trim: true, default: '#shop' },
    active: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

bannerSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);
