const { Router } = require('express');
const { listProducts, getProduct } = require('../controllers/productController');
const authenticate = require('../middleware/authenticate');
const validateObjectId = require('../middleware/validateObjectId');

const router = Router();
router.get('/', listProducts);
router.get('/:id', validateObjectId('id'), getProduct);

module.exports = router;
