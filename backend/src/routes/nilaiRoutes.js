const express = require('express');
const router = express.Router();
const nilaiController = require('../controllers/nilaiController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/nilai', verifyToken, nilaiController.inputNilai);
router.get('/nilai/rekap', [verifyToken, isAdmin], nilaiController.getRecap);
router.get('/nilai/:pendaftaranId', verifyToken, nilaiController.getSummary);
router.post('/nilai/admin', [verifyToken, isAdmin], nilaiController.adminInputNilai);
router.post('/nilai/batch', verifyToken, nilaiController.batchInputNilai);
router.post('/sidang', [verifyToken, isAdmin], nilaiController.scheduleSidang);

module.exports = router;
