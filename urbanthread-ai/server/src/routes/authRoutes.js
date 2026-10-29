const { Router } = require('express');
const { register, login, adminLogin, adminSetup, me, updateProfile, changePassword, resetPassword } = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/admin-setup', adminSetup);
router.post('/admin-set-password', adminSetup);
router.post('/reset-password', resetPassword);
router.post('/change-password', authenticate, changePassword);
router.get('/me', authenticate, me);
router.patch('/profile', authenticate, updateProfile);

module.exports = router;
