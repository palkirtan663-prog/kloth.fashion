const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required.'], trim: true, maxlength: 80, unique: true },
    price: { type: Number, required: [true, 'Price (INR) is required.'], min: [0, 'Price cannot be negative.'] },
    category: { type: String, required: [true, 'Category is required.'], trim: true, maxlength: 40 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    // Local path such as /images/studio-cargo.jpg, or an https:// URL.
    image: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: (v) => v === '' || /^(\/(?!\/)|https:\/\/|data:image\/)/.test(v),
        message: 'Image must be a local path, data URI, or https:// URL.',
      },
    },
    gallery: [{ type: String, trim: true }],
    sizes: {
      type: [String],
      default: ['S', 'M', 'L', 'XL'],
    },
    stock: { type: Number, min: 0, default: 25 },
    gender: {
      type: String,
      enum: ['Unisex', 'Men', 'Women'],
      default: 'Unisex',
    },
    color: { type: String, trim: true, maxlength: 40, default: '' },
    rating: { type: Number, min: 0, max: 5, default: 4.8 },
    tag: { type: String, trim: true, maxlength: 30, default: '' },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });

productSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
