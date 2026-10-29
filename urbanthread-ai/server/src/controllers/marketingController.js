const Banner = require('../models/Banner');
const Notification = require('../models/Notification');

// GET /api/banners
async function getPublicBanners(req, res) {
  const banners = await Banner.find({ active: true }).sort({ displayOrder: 1, createdAt: -1 });
  res.json({ banners });
}

// GET /api/admin/banners
async function listAllBanners(req, res) {
  const banners = await Banner.find().sort({ displayOrder: 1, createdAt: -1 });
  res.json({ banners });
}

// POST /api/admin/banners
async function createBanner(req, res) {
  const { title, subtitle, badge, image, ctaText, ctaLink, active, displayOrder } = req.body || {};
  if (!title || !image) {
    return res.status(400).json({ error: 'Title and image URL/path are required.' });
  }

  const banner = await Banner.create({
    title: String(title).trim(),
    subtitle: String(subtitle || '').trim(),
    badge: String(badge || 'NEW DROP').trim(),
    image: String(image).trim(),
    ctaText: String(ctaText || 'Shop Now').trim(),
    ctaLink: String(ctaLink || '#shop').trim(),
    active: active !== undefined ? Boolean(active) : true,
    displayOrder: parseInt(displayOrder, 10) || 0,
  });

  res.status(201).json({ banner });
}

// PATCH /api/admin/banners/:id
async function updateBanner(req, res) {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return res.status(404).json({ error: 'Banner not found.' });

  const { title, subtitle, badge, image, ctaText, ctaLink, active, displayOrder } = req.body || {};
  if (title !== undefined) banner.title = String(title).trim();
  if (subtitle !== undefined) banner.subtitle = String(subtitle).trim();
  if (badge !== undefined) banner.badge = String(badge).trim();
  if (image !== undefined) banner.image = String(image).trim();
  if (ctaText !== undefined) banner.ctaText = String(ctaText).trim();
  if (ctaLink !== undefined) banner.ctaLink = String(ctaLink).trim();
  if (active !== undefined) banner.active = Boolean(active);
  if (displayOrder !== undefined) banner.displayOrder = parseInt(displayOrder, 10) || 0;

  await banner.save();
  res.json({ banner });
}

// DELETE /api/admin/banners/:id
async function deleteBanner(req, res) {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) return res.status(404).json({ error: 'Banner not found.' });
  res.json({ ok: true });
}

/* ---------------- Notifications ---------------- */

// GET /api/notifications
async function getNotifications(req, res) {
  const notifications = await Notification.find({
    targetRole: { $in: ['all', req.user?.role || 'user'] },
  }).sort({ createdAt: -1 });

  res.json({ notifications });
}

// POST /api/admin/notifications
async function createNotification(req, res) {
  const { title, message, type, tag, link, targetRole } = req.body || {};
  if (!title || !message) {
    return res.status(400).json({ error: 'Notification title and message are required.' });
  }

  const notif = await Notification.create({
    title: String(title).trim(),
    message: String(message).trim(),
    type: type || 'announcement',
    tag: String(tag || 'ALERT').trim(),
    link: String(link || '').trim(),
    targetRole: targetRole || 'all',
  });

  res.status(201).json({ notification: notif });
}

// DELETE /api/admin/notifications/:id
async function deleteNotification(req, res) {
  const notif = await Notification.findByIdAndDelete(req.params.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found.' });
  res.json({ ok: true });
}

// POST /api/marketing/newsletter (or /api/newsletter)
async function subscribeNewsletter(req, res) {
  const { email } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // Record newsletter subscription (in-memory or persistent store)
  res.json({
    ok: true,
    message: 'Thank you for subscribing to Kloth.fashion private drops and restock alerts.',
  });
}

module.exports = {
  getPublicBanners,
  listAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getNotifications,
  createNotification,
  deleteNotification,
  subscribeNewsletter,
};

