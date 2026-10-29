const User = require('../models/User');
const Product = require('../models/Product');
const { ROLES, pickProductFields } = require('../utils/validators');

/* ------------------------------ Users ------------------------------ */

async function listUsers(req, res) {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users });
}

async function updateUserRole(req, res) {
  const { role } = req.body || {};
  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Role must be "user" or "admin".' });
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot change your own role.' });
  }

  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found.' });

  if (target.role === 'admin' && role !== 'admin' && (await User.countDocuments({ role: 'admin' })) <= 1) {
    return res.status(400).json({ error: 'There must always be at least one admin.' });
  }

  target.role = role;
  await target.save();
  res.json({ user: target });
}

async function deleteUser(req, res) {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  }

  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found.' });

  if (target.role === 'admin' && (await User.countDocuments({ role: 'admin' })) <= 1) {
    return res.status(400).json({ error: 'There must always be at least one admin.' });
  }

  await target.deleteOne();
  res.json({ ok: true });
}

/* ----------------------------- Products ----------------------------- */

async function createProduct(req, res) {
  const product = await Product.create(pickProductFields(req.body)); // validation errors -> 400, duplicate name -> 409
  res.status(201).json(product);
}

async function updateProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  product.set(pickProductFields(req.body));
  await product.save(); // runs the schema validators
  res.json(product);
}

async function deleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  res.json({ ok: true });
}

module.exports = { listUsers, updateUserRole, deleteUser, createProduct, updateProduct, deleteProduct };
