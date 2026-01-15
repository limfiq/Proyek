const express = require('express');
const router = express.Router();
const instansiController = require('../controllers/instansiController');

// Public route to fetch active vacancies (instansi list)
router.get('/lowongan', instansiController.findPublic);
router.get('/lowongan/:id', instansiController.findPublicOne);

module.exports = router;
