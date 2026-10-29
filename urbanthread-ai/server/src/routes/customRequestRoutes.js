const { Router } = require('express');
const customRequests = require('../controllers/customRequestController');
const authenticate = require('../middleware/authenticate');
const validateObjectId = require('../middleware/validateObjectId');

const router = Router();
router.use(authenticate);

router.post('/', customRequests.createCustomRequest);
router.get('/mine', customRequests.getMyCustomRequests);
router.get('/:id', validateObjectId('id'), customRequests.getCustomRequestById);
router.patch('/:id/respond', validateObjectId('id'), customRequests.respondToQuote);

module.exports = router;
