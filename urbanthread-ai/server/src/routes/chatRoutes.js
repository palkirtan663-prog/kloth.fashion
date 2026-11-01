const { Router } = require('express');
const { chat } = require('../controllers/chatController');
const { optionalAuthenticate } = require('../middleware/authenticate');

const router = Router();
// Shoppers (both members and guests) can ask for style advice and product recommendations
router.post('/', optionalAuthenticate, chat);

module.exports = router;
