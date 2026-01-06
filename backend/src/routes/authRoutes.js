const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

router.post('/register/mahasiswa', controller.registerMahasiswa);
router.post('/login', controller.login);
router.post('/change-password', require('../middleware/authMiddleware').verifyToken, controller.changePassword);

module.exports = router;
