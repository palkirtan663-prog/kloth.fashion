const { Router } = require('express');
const marketing = require('../controllers/marketingController');

const router = Router();

// Public banner endpoint
router.get('/banners', marketing.getPublicBanners);

// Notification endpoint
router.get('/notifications', marketing.getNotifications);

// Newsletter subscription endpoint
router.post('/newsletter', marketing.subscribeNewsletter);

module.exports = router;

