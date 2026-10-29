const { Router } = require('express');
const support = require('../controllers/supportController');
const authenticate = require('../middleware/authenticate');
const validateObjectId = require('../middleware/validateObjectId');

const router = Router();
router.use(authenticate);

router.post('/tickets', support.createTicket);
router.get('/tickets/mine', support.getMyTickets);
router.get('/tickets/:id', validateObjectId('id'), support.getTicketById);
router.post('/tickets/:id/reply', validateObjectId('id'), support.replyToTicket);

module.exports = router;
