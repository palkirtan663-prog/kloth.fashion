const Product = require('../models/Product');
const { escapeRegex } = require('../utils/validators');

// GET /api/products?q=tee&category=Hoodies&gender=Men&size=M&minPrice=500&maxPrice=2000&tag=TRENDING&sort=newest
async function listProducts(req, res) {
  const filter = {};
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  const gender = typeof req.query.gender === 'string' ? req.query.gender.trim() : '';
  const size = typeof req.query.size === 'string' ? req.query.size.trim() : '';
  const tag = typeof req.query.tag === 'string' ? req.query.tag.trim() : '';
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 60) : '';
  const minPrice = parseFloat(req.query.minPrice);
  const maxPrice = parseFloat(req.query.maxPrice);

  if (category && category !== 'All') filter.category = category;
  if (gender && gender !== 'All') filter.gender = { $in: [gender, 'Unisex'] };
  if (size && size !== 'All') filter.sizes = size;
  if (tag && tag !== 'All') filter.tag = new RegExp(`^${escapeRegex(tag)}$`, 'i');

  if (!isNaN(minPrice) || !isNaN(maxPrice)) {
    filter.price = {};
    if (!isNaN(minPrice)) filter.price.$gte = minPrice;
    if (!isNaN(maxPrice)) filter.price.$lte = maxPrice;
  }

  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { category: rx }, { color: rx }, { tag: rx }, { description: rx }];
  }

  let sortCriteria = { createdAt: -1, _id: 1 };
  const sort = typeof req.query.sort === 'string' ? req.query.sort.trim() : '';
  if (sort === 'price-asc') sortCriteria = { price: 1 };
  else if (sort === 'price-desc') sortCriteria = { price: -1 };
  else if (sort === 'rating') sortCriteria = { rating: -1 };
  else if (sort === 'name') sortCriteria = { name: 1 };
  else if (sort === 'newest') sortCriteria = { createdAt: -1 };

  const products = await Product.find(filter).sort(sortCriteria);
  res.json(products);
}

async function getProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  res.json(product);
}

module.exports = { listProducts, getProduct };
