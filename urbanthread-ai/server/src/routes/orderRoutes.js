const { Router } = require('express');
const orders = require('../controllers/orderController');
const authenticate = require('../middleware/authenticate');
const { optionalAuthenticate } = authenticate;

const router = Router();

// Public / open routes
router.get('/offers', orders.getLiveOffers);
router.get('/track/:identifier', orders.getOrderByIdOrTracking);

// Create order accepts authenticated customer OR guest checkout with auto-registration
router.post('/', optionalAuthenticate, orders.createOrder);

// Authenticated user routes
router.use(authenticate);
router.get('/mine', orders.getMyOrders);
router.post('/:id/cancel', orders.cancelOrder);
router.post('/:id/return', orders.requestReturn);

module.exports = router;
