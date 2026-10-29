const { Router } = require('express');
const admin = require('../controllers/adminController');
const orders = require('../controllers/orderController');
const customRequests = require('../controllers/customRequestController');
const support = require('../controllers/supportController');
const marketing = require('../controllers/marketingController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validateObjectId = require('../middleware/validateObjectId');

const router = Router();
router.use(authenticate, authorize('admin')); // every /api/admin/* route is admin-only

// Analytics & Stats
router.get('/stats', orders.getAdminStats);

// User Management
router.get('/users', admin.listUsers);
router.patch('/users/:id/role', validateObjectId('id'), admin.updateUserRole);
router.delete('/users/:id', validateObjectId('id'), admin.deleteUser);

// Products
router.post('/products', admin.createProduct);
router.patch('/products/:id', validateObjectId('id'), admin.updateProduct);
router.delete('/products/:id', validateObjectId('id'), admin.deleteProduct);

// Orders & Returns
router.get('/orders', orders.listAllOrders);
router.patch('/orders/:id/status', validateObjectId('id'), orders.updateOrderStatus);
router.patch('/orders/:id/return-status', validateObjectId('id'), orders.handleReturnRequest);

// Custom Clothing Requests & Quotations
router.get('/custom-requests', customRequests.listAllCustomRequests);
router.patch('/custom-requests/:id/quote', validateObjectId('id'), customRequests.provideQuote);
router.patch('/custom-requests/:id/status', validateObjectId('id'), customRequests.updateCustomRequestStatus);

// Support Inquiries & Tickets
router.get('/support/tickets', support.listAllTickets);
router.patch('/support/tickets/:id/status', validateObjectId('id'), support.updateTicketStatus);
router.post('/support/tickets/:id/reply', validateObjectId('id'), support.replyToTicket);

// Homepage Banners & Collections Showcase
router.get('/banners', marketing.listAllBanners);
router.post('/banners', marketing.createBanner);
router.patch('/banners/:id', validateObjectId('id'), marketing.updateBanner);
router.delete('/banners/:id', validateObjectId('id'), marketing.deleteBanner);

// Customer Marketing Notifications
router.post('/notifications', marketing.createNotification);
router.delete('/notifications/:id', validateObjectId('id'), marketing.deleteNotification);

module.exports = router;
