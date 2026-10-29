const { Router } = require('express');
const { chat } = require('../controllers/chatController');
const authenticate = require('../middleware/authenticate');

const router = Router();
router.post('/', authenticate, chat);

module.exports = router;
